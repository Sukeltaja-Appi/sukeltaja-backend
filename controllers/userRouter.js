const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')


// Returns all current events from database as JSON

userRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('events', { content: 1, startdate: 1, enddate: 1 })

  res.json(users.map(User.format))
})

userRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('events', { content: 1, startdate: 1, enddate: 1 })

  res.json(User.format(user))
})

userRouter.post('/', async (req, res) => {
  try {
    console.log(req.body)

    const body = req.body

    if (body.username === undefined || body.password === undefined){
      return res.status(400).json({ error: 'user or password missing' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      password: passwordHash,
      events: body.events
    })

    const savedUser = await user.save()
    res.json(User.format(savedUser))
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = userRouter
