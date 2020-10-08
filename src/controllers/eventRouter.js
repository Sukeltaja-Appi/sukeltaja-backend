const eventRouter = require('express').Router()
const Event = require('../models/event')
const User = require('../models/user')
const { requireAuthentication, requireBoAuthentication } = require('../middleware/authenticate')
const handleEndDate = require('../middleware/dates')
const { userIsInArray } = require('../utils/userHandler')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')

eventRouter.get('/bo', requireBoAuthentication, asyncRouteWrapper(async (req, res) => {
  const events = await Event.find({})

  res.json(events.map(Event.format))
}))

// From here on require authentication on all routes.
eventRouter.all('*', requireAuthentication)

eventRouter.get('/', asyncRouteWrapper(async (req, res) => {
  const events = await Event
    .find({
      $or: [
        { 'creator': res.locals.user._id },
        { 'admins': { $in: [res.locals.user._id] } },
        { 'participants': { $in: [res.locals.user._id] } }
      ]
    })

  const user = await User.findById(res.locals.user.id)

  const filteredEvents = []

  events.forEach(e => {
    user.events.forEach(usersEvent => {
      if (e._id.equals(usersEvent._id)) filteredEvents.push(e)
    })
  })

  res.json(filteredEvents.map(Event.format))
}))

// Fetches single event for authorized user.
eventRouter.get('/:id', asyncRouteWrapper(async (req, res) => {
  if (req.params.id.length !== 24) {
    return res.status(400).json({ error: 'id not valid' })
  }
  const event = await Event.findById(req.params.id)

  if (!event) {
    return res.status(404).json({ error: 'wrong id' })
  }
  if (
    event.creator.id !== res.locals.user.id
    && !userIsInArray(res.locals.user.id, event.admins)
    && !userIsInArray(res.locals.user.id, event.participants)
    && !userIsInArray(res.locals.user.id, event.pending)
  ) {
    return res.status(401).json({ error: 'unauthorized request' })
  }

  res.json(Event.format(event))
}))

// Authorized user can post an event.
eventRouter.post('/', asyncRouteWrapper(async (req, res) => {
  const { title, description, startdate, enddate, dives, eventMessages, target } = req.body
  const { user } = res.locals

  if (!title) {
    return res.status(400).json({ error: 'missing fields' })
  }

  const event = new Event({
    title,
    description,
    startdate: startdate || new Date(),
    enddate: handleEndDate(startdate || new Date(), enddate),
    creator: user.id,
    dives,
    eventMessages,
    target
  })

  const savedEvent = await event.save()
    .then(event => event.populate('creator', 'username').execPopulate())

  user.events = user.events.concat(savedEvent.id)
  await user.save()

  res.json(Event.format(savedEvent))
}))

/*
This method takes EventID and checks if current token holder has a pending
invite on the event pending list. If there is match, it adds the user either
as participant or admin, according to acces variable ('participant' || 'admin')
*/
eventRouter.put('/:id/add', asyncRouteWrapper(async (req, res) => {
  const event = await Event.findById(req.params.id)
  const { user } = res.locals

  if (!event) {
    return res.status(404).json({ error: 'event not found' })
  }

  let { admins, pending, participants } = event

  const invites = pending.filter(invite => invite.user.equals(user._id))
  let invite = invites.find(invite => invite.access === 'admin')

  if (!invite) invite = invites.find(invite => invite.access === 'participant')

  if (!invite) {
    return res.status(401).json({ error: 'unauthorized request' })
  }

  pending = pending.filter(p => p.user._id !== invite.user._id)

  if (invite.access === 'admin') {
    participants = participants.filter(p => !p._id.equals(invite.user._id))
    admins = event.admins.concat(user._id)
  } else if (invite.access === 'participant') {
    participants = event.participants.concat(user._id)
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    { admins, participants, pending },
    { new: true }
  )

  const addedUser = await User.findById(user._id)

  addedUser.events = addedUser.events.concat(updatedEvent._id)
  await addedUser.save()

  res.json(Event.format(updatedEvent))

  req.io.updateEvent(req.params.id, user._id)
}))

// Authorized user can edit own event.
eventRouter.put('/:id', asyncRouteWrapper(async (req, res) => {
  const { title, description, startdate, enddate, admins, participants,
    pending, dives, target, eventMessages } = req.body

  if (req.params.id.length !== 24) {
    return res.status(400).json({ error: 'invalid id' })
  }
  const event = await Event.findById(req.params.id)

  if (!event) {
    return res.status(404).json({ error: 'wrong id' })
  }
  if (!title) {
    return res.status(400).json({ error: 'missing fields' })
  }

  if (event.creator.id !== res.locals.user.id && !userIsInArray(res.locals.user.id, event.admins)) {

    return res.status(401).json({ error: 'unauthorized request' })
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    { title, description, startdate, enddate, admins, participants, pending, dives, eventMessages, target },
    { new: true }
  )

  res.json(Event.format(updatedEvent))

  req.io.updateEvent(req.params.id, res.locals.user._id)
}))

eventRouter.delete('/reference/:id', asyncRouteWrapper(async (req, res) => {
  const user = await User.findById(res.locals.user.id)

  user.events = user.events.filter(e => !e._id.equals(req.params.id))
  user.save()

  res.status(204).end()
}))

// Authorized user can delete own event.
eventRouter.delete('/:id', asyncRouteWrapper(async (req, res) => {
  if (req.params.id.length !== 24) {
    return res.status(400).json({ error: 'invalid id' })
  }
  const event = await Event.findById(req.params.id)

  if (!event) {
    return res.status(404).json({ error: 'wrong id' })
  }
  if (event.creator.id !== res.locals.user.id) {
    return res.status(401).json({ error: 'unauthorized request' })
  }

  // Delete this check?
  if (event.dives.length > 0) {
    res.status(401).json({ error: 'delete dives first' })
  }

  await Event.findByIdAndRemove(req.params.id)

  res.status(204).end()
}))

module.exports = eventRouter
