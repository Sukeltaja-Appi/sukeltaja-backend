const eventRouter = require('express').Router()
const Event = require('../models/event')
const requireAuthentication = require('../middleware/authenticate')
const handleEndDate = require('../middleware/dates')

eventRouter.get('/', async (req, res) => {
  const events = await Event
    .find({})
    .populate('user', { username: 1 })

  res.json(events.map(Event.format))
})

// From here on require authentication on all routes.
eventRouter.all('*', requireAuthentication)

// Fetches single event for authorized user.
eventRouter.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user', { username: 1 })

    if (event.user.id !== res.locals.user.id){
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
    const { content, startdate, enddate } = req.body
    const { user } = res.locals

    if (!content) {
      return res.status(400).json({ error: 'content missing' })
    }

    const event = new Event({
      content,
      startdate: startdate || new Date(),
      enddate: handleEndDate(startdate || new Date(), enddate),
      user: user.id
    })

    const savedEvent = await event.save()

    user.events = user.events.concat(savedEvent.id)
    await user.save()

    res.json(Event.format(savedEvent))

  } catch (exception) {
    return res.status(500).json({ error: 'something went wrong...' })
  }
})

// Authorized user can edit own event.
eventRouter.put('/:id', async (req, res) => {
  try {
    const { content, startdate, enddate } = req.body

    if (!content || !startdate || !enddate) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const event = await Event.findById(req.params.id)
      .populate('user', { username: 1 })

    if (event.user.id !== res.locals.user.id){
      return res.status(401).json({ error: 'unauthorized request' })
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { content, startdate, enddate },
      { new: true }
    ).populate('user', { username: 1 })

    res.json(Event.format(updatedEvent))

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
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
    await Event.findByIdAndRemove(req.params.id)

    res.status(204).end()
  } catch (exception) {
    res.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = eventRouter
