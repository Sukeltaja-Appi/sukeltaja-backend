const messageRouter = require('express').Router()
const Message = require('../models/message')
const User = require('../models/user')
//const bcrypt = require('bcrypt')
const requireAuthentication = require('../middleware/authenticate')

// Returns all current events from database as JSON
messageRouter.all('*', requireAuthentication)

// Still needs to filter for received status
messageRouter.get('/', async (req, res) => {
  try {
    const messages = await Message
      .find({
        $or: [
          { 'receivers': { $in: [res.locals.user.id] } }
        ]
      })
      .populate('sender', { username: 1 })

    res.json(messages.map(Message.format))
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

messageRouter.post('/', async (req, res) => {
  try {
    const { receivers, created, type, data } = req.body
    const { user } = res.locals

    if (!receivers) {
      return res.status(400).json({ error: 'recievers missing' })
    }

    let received = []

    for (let i = 0; i < receivers.length; i++) received.push('pending')

    const message = new Message({
      sender: user.id,
      receivers,
      created,
      received,
      type,
      data
    })

    const savedMessage = await message.save()

    for (let i = 0; i < receivers.length; i++) {
      var receiver = await User.findById(receivers[i])

      receiver.messages = receiver.messages.concat(savedMessage.id)

      await receiver.save()
    }

    console.log(savedMessage)
    res.json(Message.format(savedMessage))

  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong...' })
  }
})

messageRouter.put('/:id', async (req, res) => {
  try {
    const { recieved } = req.body

    if (!recieved) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { recieved },
      { new: true }
    )

    res.json(Message.format(updatedMessage))

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

module.exports = messageRouter
