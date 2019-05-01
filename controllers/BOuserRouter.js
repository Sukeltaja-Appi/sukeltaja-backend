const BOuserRouter = require('express').Router()
const BOUser = require('../models/bouser')
const bcrypt = require('bcrypt')
const { requireBoAuthentication } = require('../middleware/authenticate')

// Returns all current events from database as JSON
BOuserRouter.all('*', requireBoAuthentication)

BOuserRouter.get('/', async (req, res) => {
  try {
    console.log(res.locals.user.admin)
    if (!res.locals.user.admin) {
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

BOuserRouter.put('/', async (req, res) => {
  try{
    const bouser = await BOUser.findOne({ username: req.body.username })
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds)

    if(res.locals.user.admin){
      await BOUser.findByIdAndUpdate(
        bouser._id,
        { password: passwordHash, admin: req.body.admin },
        { new: true }
      )
    }
    else {
      if(!bouser._id.equals(res.locals.user.id)){
        return res.status(401).json({ error: 'unauthorized request' })
      }
      await BOUser.findByIdAndUpdate(
        bouser._id,
        { password: passwordHash },
        { new: true }
      )
      res.status(204).end()
    }
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

BOuserRouter.post('/', async (req, res) => {
  try {
    if (!res.locals.user.admin) {
      return res.status(401).json({ error: 'unauthorized request' })
    }
    const body = req.body

    if (!body.username || !body.password) {
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
