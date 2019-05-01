const eventMessageRouter = require('express').Router()
const EventMessage = require('../models/eventMessage')
const { requireAuthentication } = require('../middleware/authenticate')
const { io } = require('./webSocketController')
const { dbObjectsInUse, sleep } = require('../controllers/DBSynchronizationController')
const Event = require('../models/event')

// From here on require authentication on all routes.
eventMessageRouter.all('*', requireAuthentication)

eventMessageRouter.get('/', async (req, res) => {
  try {
    const eventMessages = await EventMessage
      .find({})
      .where('user').equals(res.locals.user.id)

    res.json(eventMessages.map(EventMessage.format))
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

eventMessageRouter.post('/', async (req, res) => {
  try {
    const { text, created, event } = req.body
    var { user } = res.locals

    if (!event || !created || !text) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const eventMessage = new EventMessage({
      text: text,
      created: created || new Date(),
      event: event,
      user: user._id
    })

    const savedEventMessage = await eventMessage.save()

    // Synchronized block starts. ---------------------
    while(dbObjectsInUse[event]) await sleep(0.01)
    dbObjectsInUse[event] = true

    const eventMessageEvent = await Event.findById(event)

    eventMessageEvent.eventMessages = eventMessageEvent.eventMessages.concat(savedEventMessage.id)
    await eventMessageEvent.save()

    delete dbObjectsInUse[event]
    // Synchronized block ends. -----------------------

    res.json(EventMessage.format(savedEventMessage))

    io.updateEventAll(savedEventMessage.event)

  } catch (exception) {
    // semaphore reset starts---------------------
    try {
      const { event } = req.body

      delete dbObjectsInUse[event]
    } catch(e) {console.log(e)}
    // semaphore reset ends. ---------------------

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

eventMessageRouter.delete('/:id', async (req, res) => {
  try {

    await EventMessage.findByIdAndRemove(req.params.id)

    res.status(204).end()
  } catch (exception) {
    res.status(400).send({ error: 'malformatted id' })
  }
})

eventMessageRouter.put('/:id', async (req, res) => {
  try {
    const { created, event, text } = req.body

    if (!created || !event || !text ) {
      return res.status(400).json({ error: 'missing fields' })
    }
    const eventMessage = await EventMessage.findById(req.params.id)
    const eventMessageUser = eventMessage.user
    var { user } = res.locals

    if (!user._id.equals(eventMessageUser._id)) {
      return res.status(401).json({ error: 'unauthorized request' })
    }

    const updatedEventMessage = await EventMessage.findByIdAndUpdate(
      req.params.id,
      { created, event, text },
      { new: true }
    )

    res.json(EventMessage.format(updatedEventMessage))

    io.updateEventAll(updatedEventMessage.event)

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})
module.exports = eventMessageRouter
