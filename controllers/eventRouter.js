const eventRouter = require('express').Router()
const Event = require('../models/event')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')){
    return authorization.substring(7)
  }
  return null
}

eventRouter.get('/', async (req, res) => {
  const events = await Event
    .find({})
    .populate('user', {username: 1 })

  res.json(events.map(Event.format))
})

eventRouter.get('/:id', async (req, res) => {
  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    console.log(user)
    if (user === undefined){
      return res.status(400).json({ error: 'user not found with token'})
    }

    const event = await Event.findById(req.params.id)
      .populate('user', { username: 1 })

    if (event.user._id != user.id){
      return res.status(401).json({ error: 'unauthorized request'})
    }


    res.json(Event.format(event))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

eventRouter.get('/test/:id', async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('user', { username: 1 })

  res.json(Event.format(event))
})

// Post-calls on /events create a new "Event", and adds it to the database.
eventRouter.post('/', async (req, res) => {
  try{
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    console.log(req.body)

    const body = req.body
    if (body.content === undefined){
      return res.status(400).json({ error: 'content missing' })
    }

    const user = await User.findById(decodedToken.id)

    if (user === undefined){
      return res.status(400).json({ error: 'user not found with token'})
    }
    const event = new Event({
      content: body.content,
      startdate: new Date(),
      enddate: new Date(),
      user: user._id
    })

    const savedEvent = await event.save()

    user.events = user.events.concat(savedEvent._id)
    await user.save()

    res.json(Event.format(savedEvent))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

module.exports = eventRouter
