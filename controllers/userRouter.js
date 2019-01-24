const userRouter = require('express').Router()
const User = require('../models/user')

const formatUser = (user) => {
    const formattedUser = {...user._doc, id: user._id }
    delete formattedUser._id
    delete formattedUser.__v
  
    return formattedUser
  }
  
  
  
  
  // Returns all current events from database as JSON
  
  
  userRouter.get('/', (req, res) => {
  
    User
      .find({})
      .then(users => {
        res.json(users.map(formatUser))
      })
  })
  
  userRouter.post('/', (req, res) => {
    console.log(req.body)
  
    const body = req.body
  
    if (body.username === undefined || body.password === undefined){
      return res.status(400).json({ error: 'user or password missing' })
    }
  
    const user = new User({
      username: body.username,
      password: body.password,
      events: body.events
    })
  
    user
      .save()
      .then(savedUser => {
        res.json(formatUser(savedUser))
      })
  })

  module.exports = userRouter