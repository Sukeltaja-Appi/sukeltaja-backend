const eventRouter = require('express').Router()
const Event = require('../models/event')
const User = require('../models/user')
const requireAuthentication = require('../middleware/authenticate')
const handleEndDate = require('../middleware/dates')
const { userIsInArray } = require('../utils/userHandler')

eventRouter.get('/unauth', async (req, res) => {
  try {
    const events = await Event.find({})

    res.json(events)
  } catch (exception) {

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

// From here on require authentication on all routes.
eventRouter.all('*', requireAuthentication)

eventRouter.get('/bo', async (req, res) => {
  try {
    if (!res.locals.admin) {
      return res.status(401).json({ error: 'unauthorized request' })
    }
    const events = await Event.find({})

    res.json(events.map(Event.format))
  } catch (exception) {

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

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

    res.json(events.map(Event.format))
  } catch (exception) {

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }

})

// Fetches single event for authorized user.
eventRouter.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

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
    return res.status(500).json({ error: 'something went wrong...' })
  }
})

// Authorized user can post an event.
eventRouter.post('/', async (req, res) => {
  try {
    const { title, description, startdate, enddate, dives, target } = req.body
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
    var admins = event.admins
    var pending = event.pending
    var participants = event.participants
    var userObject
    var i

    for (i = 0; i < pending.length; i++) {
      if (`${pending[i].user._id}` === `${user._id}`) {
        userObject = pending[i]
        pending.splice(i, 1)

      }
    }

    if (userObject.access === 'admin') {
      admins = event.admins.concat(userObject.user._id)
    }
    if (userObject.access === 'participant') {
      participants = event.participants.concat(userObject.user._id)
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
    const { title, description, startdate, enddate, admins, participants, pending, dives, target } = req.body

    if (!title) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const event = await Event.findById(req.params.id)

    if (event.creator.id !== res.locals.user.id && !event.admins.includes(res.locals.user.id)) {

      return res.status(401).json({ error: 'unauthorized request' })
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, startdate, enddate, admins, participants, pending, dives, target },
      { new: true }
    )

    res.json(Event.format(updatedEvent))

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

// Authorized user can delete own event.
eventRouter.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (event.dives.length > 0) {
      res.status(401).json({ error: 'delete dives first' })
    }

    await Event.findByIdAndRemove(req.params.id)

    res.status(204).end()
  } catch (exception) {
    res.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = eventRouter
