const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { requireAuthentication } = require('../middleware/authenticate')
const Joi = require('joi')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')
const { validation: validationConfig, saltRounds } = require('../utils/config')

userRouter.post('/', asyncRouteWrapper(async (req, res) => {
  const joiSchema = Joi.object({
    username: Joi.string()
      .min(validationConfig.usernameLength.min)
      .max(validationConfig.usernameLength.max),
    password: Joi.string()
      .min(validationConfig.passwordLength.min)
      .max(validationConfig.passwordLength.max),
    email: Joi.string().email(),
  }).options({
    presence: 'required',
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  })

  const { value: validatedBody, error } = joiSchema.validate(req.body)

  if (error)
    return res.status(400).json({ error: error.message })

  try {
    const body = validatedBody

    if (!body.username || !body.password || !body.email) {
      return res.status(400).json({ error: 'username or password missing' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      password: passwordHash,
      events: body.events,
      dives: body.dives,
      email: body.email
    })

    const savedUser = await user.save()

    res.json(User.format(savedUser))

  } catch (exception) {
    console.log(exception._message)
    if (exception.message.includes('User validation failed')) {
      res.status(400).json({ error: 'username not unique' })
    } else {
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
}))

// Returns all current events from database as JSON
userRouter.all('*', requireAuthentication)

userRouter.get('/', asyncRouteWrapper(async (req, res) => {
  const users = await User
    .find({})

  res.json(users.map(User.format))
}))

userRouter.get('/names', asyncRouteWrapper(async (req, res) => {
  const users = await User
    .find({})

  const formattedUsers = []

  users.forEach(u => {
    formattedUsers.push({
      _id: u._id,
      username: u.username
    })
  })

  res.json(formattedUsers)
}))

userRouter.get('/:id', asyncRouteWrapper(async (req, res) => {
  const user = await User.findById(req.params.id)

  res.json(User.format(user))
}))

module.exports = userRouter
