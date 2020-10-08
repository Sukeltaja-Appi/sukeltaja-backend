const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const BOUser = require('../models/bouser')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')

loginRouter.post('/', asyncRouteWrapper(async (req, res) => {
  const body = req.body

  const user = await User.findOne({ username: body.username })
    .populate({ path: 'events', options: { autopopulate: false } })
    .populate({ path: 'dives', options: { autopopulate: false } })
    .populate({ path: 'messages', options: { autopopulate: false } })

  const passwordCorrect = !user
    ? false
    : await bcrypt.compare(body.password, user.password)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  res.status(200).send({ token, ...User.format(user) })
}))

loginRouter.post('/BO', asyncRouteWrapper(async (req, res) => {
  const body = req.body

  const BOuser = await BOUser.findOne({ username: body.username })
  const passwordCorrect = !BOuser
    ? false
    : await bcrypt.compare(body.password, BOuser.password)

  if (!(BOuser && passwordCorrect)) {
    return res.status(401).json({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: BOuser.username,
    id: BOuser._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  res.status(200).send({ token, username: BOuser.username, id: BOuser._id })
}))

module.exports = loginRouter
