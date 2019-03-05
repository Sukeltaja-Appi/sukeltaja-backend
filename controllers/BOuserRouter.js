const BOuserRouter = require('express').Router()
const BOUser = require('../models/BOuser')
const bcrypt = require('bcrypt')

// Returns all current events from database as JSON

BOuserRouter.get('/', async (req, res) => {
  try{
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
    const body = req.body

    if (body.username === undefined || body.password === undefined){
      return res.status(400).json({ error: 'user or password missing' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const BOuser = new BOUser({
      username: body.username,
      password: passwordHash,
      admin: new Boolean(false)
    })

    const savedBOUser = await BOuser.save()

    res.json(BOUser.format(savedBOUser))

  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = BOuserRouter
