const messageRouter = require('express').Router()
const Message = require('../models/message')
const Event = require('../models/event')
const User = require('../models/user')
//const bcrypt = require('bcrypt')
const requireAuthentication = require('../middleware/authenticate')

// Returns all current events from database as JSON
messageRouter.all('*', requireAuthentication)

// Still needs to filter for received status
messageRouter.get('/', async (req, res) => {
  try {
    // const user = User.findById(res.locals.id)
    //   .populate('messages')
    //   //.populate({ path: 'messages', populate: { 'sender': { select: 'username' } } })
    //
    // const messages = user.messages
    // console.log(user)
    //
    // for(let i = 0; i < messages.length; i++) {
    //   messages[i].sender = { username: messages[i].sender }
    // }

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

// Can be removed once put is edited to only edit a field
// in received instead of replacing it.
// (Simultaneous calls from two users)
messageRouter.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', { username: 1 })

    console.log('message:---------------------------------------')
    console.log(message)
    res.json(Message.format(message))
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

    const event = await Event.findById(data.id)

    if (type === 'invitation_participant' || type === 'invitation_admin') {
      var accesstype

      if (type === 'invitation_admin') {
        accesstype = 'admin'
      } else {
        accesstype = 'participant'
      }
      for (let i = 0; i < message.receivers.length; i++) {
        event.pending = event.pending.concat({ user: message.receivers[i], access: accesstype })
      }

      event.save()
    }

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
    const { status } = req.body

    const message = Message.findById(req.params.id)

    console.log('messages:-----------------------------------------------------')
    console.log(message)
    message.populate('receivers')
    message.populate('received')
    console.log('messagesPopulated:-----------------------------------------------------')
    console.log(message)
    console.log('--------------------------------------------------------------')

    for (let i = 0; i < message.receivers.length; i++) {
      if (message.receivers[i].id === res.locals.id) {
        message.received[i] = status
      }
    }
    const updatedMessage = await message.save()

    /*
    if (!recieved) {
      return res.status(400).json({ error: 'missing fields' })
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { recieved },
      { new: true }
    )
    */

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
