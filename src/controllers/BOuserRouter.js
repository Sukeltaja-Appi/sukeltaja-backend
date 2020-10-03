const BOuserRouter = require('express').Router()
const BOUser = require('../models/bouser')
const bcrypt = require('bcrypt')
const { requireBoAuthentication } = require('../middleware/authenticate')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')
const { saltRounds } = require('../utils/config')

// Returns all current events from database as JSON
BOuserRouter.all('*', requireBoAuthentication)

BOuserRouter.get('/', asyncRouteWrapper(async (req, res) => {
  if (!res.locals.user.admin) {
    return res.status(401).json({ error: 'unauthorized request' })
  }

  const BOusers = await BOUser
    .find({})

  res.json(BOusers.map(BOUser.format))
}))

BOuserRouter.put('/', asyncRouteWrapper(async (req, res) => {
  const bouser = await BOUser.findOne({ username: req.body.username })

  if (!bouser) {
    return res.status(400).json({ error: 'wrong username' })
  }
  let passwordHash = bouser.password

  if (req.body.password) {
    passwordHash = await bcrypt.hash(req.body.password, saltRounds)
  }

  if (res.locals.user.admin) {
    var newAdminRole

    if (bouser._id.equals(res.locals.user.id)) {
      newAdminRole = true
    } else {
      newAdminRole = req.body.admin
    }
    await BOUser.findByIdAndUpdate(
      bouser._id,
      { password: passwordHash, admin: newAdminRole },
      { new: true }
    )
  }
  else {
    if (!bouser._id.equals(res.locals.user.id)) {
      return res.status(401).json({ error: 'unauthorized request' })
    }
    await BOUser.findByIdAndUpdate(
      bouser._id,
      { password: passwordHash },
      { new: true }
    )
  }

  return res.status(204).end()
}))

BOuserRouter.delete('/:id', asyncRouteWrapper(async (req, res) => {
  if (!res.locals.user.admin) {
    return res.status(401).json({ error: 'unauthorized request' })
  }
  const bouser = await BOUser.findById(req.params.id)

  if (!bouser) {
    return res.status(400).json({ error: 'wrong id' })
  }
  if (bouser.admin) {
    return res.status(401).json({ error: 'unauthorized request, you can not delete another admin' })
  }

  await BOUser.findByIdAndDelete(req.params.id)

  return res.status(204).end()
}))

BOuserRouter.post('/', asyncRouteWrapper(async (req, res) => {
  if (!res.locals.user.admin) {
    return res.status(401).json({ error: 'unauthorized request' })
  }
  const body = req.body

  if (!body.username || !body.password || !body.admin) {
    return res.status(400).json({ error: 'missing fields' })
  }

  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  const BOuser = new BOUser({
    username: body.username,
    password: passwordHash,
    admin: body.admin
  })

  const savedBOUser = await BOuser.save()

  res.json(BOUser.format(savedBOUser))
}))

module.exports = BOuserRouter
