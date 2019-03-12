const BOuserRouter = require('express').Router()
const BOUser = require('../models/bouser')
const bcrypt = require('bcrypt')
const requireAuthentication = require('../middleware/authenticate')

// Returns all current events from database as JSON
BOuserRouter.all('*', requireAuthentication)

BOuserRouter.get('/', async (req, res) => {
  try {
    if (!res.locals.admin) {
      return res.status(401).json({ error: 'unauthorized request' })
    }

    const BOusers = await BOUser
      .find({})

    res.json(BOusers.map(BOUser.format))
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

BOuserRouter.post('/', async (req, res) => {
  try {
    if (res.locals.admin) {
      return res.status(401).json({ error: 'unauthorized request' })
    }
    const body = req.body

    if (body.username === undefined || body.password === undefined) {
      return res.status(400).json({ error: 'user or password missing' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const BOuser = new BOUser({
      username: body.username,
      password: passwordHash,
      admin: false
    })

    const savedBOUser = await BOuser.save()

    res.json(BOUser.format(savedBOUser))

  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = BOuserRouter
