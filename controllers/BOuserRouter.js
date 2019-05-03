const BOuserRouter = require('express').Router()
const BOUser = require('../models/bouser')
const bcrypt = require('bcrypt')
const { requireBoAuthentication } = require('../middleware/authenticate')

// Returns all current events from database as JSON
BOuserRouter.all('*', requireBoAuthentication)

BOuserRouter.get('/', async (req, res) => {
  try {
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
  try {
    const bouser = await BOUser.findOne({ username: req.body.username })

    if (!bouser) {
      return res.status(400).json({ error: 'wrong username' })
    }
    var passwordHash

    if (req.body.password){
      const saltRounds = 10

      passwordHash = await bcrypt.hash(req.body.password, saltRounds)
    } else {
      passwordHash = bouser.password
    }

    if (res.locals.user.admin) {
      var newAdminRole

      if (bouser._id.equals(res.locals.user.id)){
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
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

BOuserRouter.delete('/:id', async (req, res) => {
  try{
    if (!res.locals.user.admin) {
      return res.status(401).json({ error: 'unauthorized request' })
    }
    const bouser = await BOUser.findById(req.params.id)

    if (!bouser){
      return res.status(400).json({ error: 'wrong id' })
    }
    if (bouser.admin){
      return res.status(401).json({ error: 'unauthorized request, you can not delete another admin' })
    }

    await BOUser.findByIdAndDelete(req.params.id)

    return res.status(204).end()

  } catch (exception) {
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
