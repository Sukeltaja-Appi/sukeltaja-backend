const messageRouter = require('express').Router()
const Message = require('../models/message')
const User = require('../models/user')
//const bcrypt = require('bcrypt')
const { messageOkToDelete, handleMessage } = require('./messageController')
const { requireAuthentication } = require('../middleware/authenticate')
const { userIndex, userEqualsUser } = require('../utils/userHandler')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')

// Returns all current events from database as JSON
messageRouter.all('*', requireAuthentication)

// Still needs to filter for received status
messageRouter.get('/', asyncRouteWrapper(async (req, res) => {
  const userID = res.locals.user.id

  const user = await User.findById(userID)
    .populate('messages')
  const messages = user.messages
    .filter(m => m.received[userIndex(userID, m.receivers)] === 'pending')

  res.json(messages.map(Message.format))
}))

messageRouter.get('/:id', asyncRouteWrapper(async (req, res) => {
  const message = await Message.findById(req.params.id)

  res.json(Message.format(message))
}))

messageRouter.post('/', asyncRouteWrapper(async (req, res) => {
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

  await handleMessage(message)

  const savedMessage = await message.save()

  for (let i = 0; i < receivers.length; i++) {
    var receiver = await User.findById(receivers[i])

    receiver.messages = receiver.messages.concat(savedMessage.id)

    await receiver.save()
  }

  res.json(Message.format(savedMessage))

  req.io.newMessage(savedMessage)
}))

// Sets the given received status for the sender.
messageRouter.put('/:id', asyncRouteWrapper(async (req, res) => {
  const { status } = req.body

  const message = await Message.findById(req.params.id)

  for (let i = 0; i < message.receivers.length; i++) {
    if (userEqualsUser(message.receivers[i], res.locals.user)) {
      message.received[i] = status
      break
    }
  }
  if (messageOkToDelete(message)) {
    await Message.findByIdAndRemove(req.params.id)

    return res.status(204).end()
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    req.params.id,
    { received: message.received },
    { new: true }
  )

  res.json(Message.format(updatedMessage))
}))

module.exports = messageRouter
