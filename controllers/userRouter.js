const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

// Returns all current events from database as JSON

userRouter.get('/', async (req, res) => {
  try{
    const users = await User
      .find({})
      .populate('events', { description: 1, startdate: 1, enddate: 1 })
      .populate('dives', { user: 1, event: 1, latitude: 1, longitude: 1 })

    res.json(users.map(User.format))
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

userRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('events', { description: 1, startdate: 1, enddate: 1 })
    .populate('dives', { user: 1, event: 1, latitude: 1, longitude: 1 })

  res.json(User.format(user))
})

userRouter.post('/', async (req, res) => {
  try {
    const body = req.body

    if (body.username === undefined || body.password === undefined){
      return res.status(400).json({ error: 'user or password missing' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      password: passwordHash,
      events: body.events,
      dives: body.dives
    })

    const savedUser = await user.save()

    res.json(User.format(savedUser))

  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = userRouter
