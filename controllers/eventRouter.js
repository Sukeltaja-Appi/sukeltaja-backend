const eventRouter = require('express').Router()
const Event = require('../models/event')
const User = require('../models/user')
const { requireAuthentication, requireBoAuthentication } = require('../middleware/authenticate')
const { io } = require('./webSocketController')
const handleEndDate = require('../middleware/dates')
const { userIsInArray } = require('../utils/userHandler')

eventRouter.get('/bo', requireBoAuthentication, async (req, res) => {
  try {
    const events = await Event.find({})

    res.json(events.map(Event.format))
  } catch (exception) {

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

// From here on require authentication on all routes.
eventRouter.all('*', requireAuthentication)

eventRouter.get('/', async (req, res) => {
  try {

    const events = await Event
      .find({
        $or: [
          { 'creator': res.locals.user._id },
          { 'admins': { $in: [res.locals.user._id] } },
          { 'participants': { $in: [res.locals.user._id] } }
        ]
      })

    const user = await User.findById(res.locals.user.id)

    events.filter(e => user.events.includes(e._id))

    res.json(events.map(Event.format))
  } catch (exception) {

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }

})

// Fetches single event for authorized user.
eventRouter.get('/:id', async (req, res) => {
  try {
    if(req.params.id.length !==24){
      return res.status(400).json({ error: 'id not valid' })
    }
    const event = await Event.findById(req.params.id)

    if(!event){
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

  } catch (exception) {
    if (exception.name === 'CastError') {
      res.status(404).json({ error: exception.message })
    } else {
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

// Authorized user can post an event.
eventRouter.post('/', async (req, res) => {
  try {
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

  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

/*
This method takes EventID and checks if current token holder has a pending
invite on the event pending list. If there is match, it adds the user either
as participant or admin, according to acces variable ('participant' || 'admin')
*/
eventRouter.put('/:id/add', async (req, res) => {

  try {
    const event = await Event.findById(req.params.id)
    const { user } = res.locals

    if (!event) {
      return res.status(404).json({ error: 'event not found' })
    }

    let { admins, pending, participants } = event

    const invites = pending.filter(invite => invite.user.equals(user._id))
    let invite = invites.find(invite => invite.access === 'admin')

    if(!invite) invite = invites.find(invite => invite.access === 'participant')

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

    io.updateEvent(req.params.id, user._id)

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

// Authorized user can edit own event.
eventRouter.put('/:id', async (req, res) => {
  try {
    const { title, description, startdate, enddate, admins, participants,
      pending, dives, target, eventMessages } = req.body

    if(req.params.id.length !==24){
      return res.status(400).json({ error: 'invalid id' })
    }
    const event = await Event.findById(req.params.id)

    if(!event){
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

    io.updateEvent(req.params.id, res.locals.user._id)

  } catch (exception) {
    console.log(exception.name)
    if (exception.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: exception.message })
    } else {
      return res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

eventRouter.delete('/reference/:id', async (req, res) => {
  try {
    const user = User.findById(res.locals.user._id)

    user.events = user.events.filter(e => !e._id.equals(req.params.id))
    user.save()

    res.status(204).end()
  } catch (exception) {
    console.log(exception.name)
    res.status(500).send({ error: exception.message })
  }
})

// Authorized user can delete own event.
eventRouter.delete('/:id', async (req, res) => {
  try {
    if(req.params.id.length !==24){
      return res.status(400).json({ error: 'invalid id' })
    }
    const event = await Event.findById(req.params.id)

    if(!event){
      return res.status(404).json({ error: 'wrong id' })
    }
    if (event.creator.id !== res.locals.user.id){
      return res.status(401).json({ error: 'unauthorized request' })
    }

    // Delete this check?
    if (event.dives.length > 0) {
      res.status(401).json({ error: 'delete dives first' })
    }

    await Event.findByIdAndRemove(req.params.id)

    res.status(204).end()
  } catch (exception) {
    console.log(exception.name)
    res.status(500).send({ error: exception.message })
  }
})

module.exports = eventRouter
