const Event = require('../models/event')
const Message = require('../models/message')
//const User = require('../models/user')
//const EventEmitter = require('events').EventEmitter
const { app } = require('../index')
const { userEqualsUser } = require('../utils/userHandler')
const http = require('http')
const server = http.createServer(app)
/*
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
  console.log(`API root starts at ${config.apiUrl}`)
})
*/

server.on('start', () => {
  console.log('emitter started!')
})

// Send data to user.
const send = (user, type, data) => {
  // This still needs to be implemented.
  console.log('sending: ', type, data, 'to user:', user)
}

// Send data to user if they are not the sender.
const sendIfNotSender = (user, senderID, type, data) => {
  if(!userEqualsUser(user, senderID)) {
    send(user, type, data)
  }
}

// Sends updated event to all participants.
server.on('updatedEvent', (eventID, senderID) => {
  const event = new Event.findByID(eventID)

  sendIfNotSender(event.creator, senderID, 'updatedEvent', event)

  for (let i = 0; i < event.admins.length; i++) {
    sendIfNotSender(event.admins[i], senderID, 'updatedEvent', event)
  }
  for (let i = 0; i < event.participants.length; i++) {
    sendIfNotSender(event.participants[i], senderID, 'updatedEvent', event)
  }

  console.log('updated event emitted!', event)
})

// Sends a new message to all receivers.
server.on('newMessage', (message) => {
  /*
  for (let i = 0; i < message.receivers.length; i++) {
    send(message.receivers[i], 'newMessage', Message.format(message))
  }
  */

  console.log('newMessage emitted!', message)
})

const subscribe = (req, res) => {
  // Still needs to be implemented!

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })

  // Heartbeat
  const nln = function() {
    res.write('\n')
  }
  const hbt = setInterval(nln, 15000)

  const onEvent = function(data) {
    res.write('retry: 500\n')
    res.write('event: event\n')
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  emitter.on('event', onEvent)

  // Clear heartbeat and listener
  req.on('close', function() {
    clearInterval(hbt)
    emitter.removeListener('event', onEvent)
  })

  console.log('subscribe called: ', req, res)

  // console.log('subscribe called: ')
  // server.emit('start')
}

module.exports = {
  server, // Is used in controllers to trigger logic 'events'
  subscribe, // Sending emitter data to clients
}
