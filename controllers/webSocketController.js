const Event = require('../models/event')
const Message = require('../models/message')
const { userEqualsUser } = require('../utils/userHandler')
// const { io } = require('../index')
const http = require('http')
const { app } = require('../index')
//const bcrypt = require('bcrypt')

const { socketAuthentication } = require('../middleware/authenticate')

console.log('webSocketController running!!!!!')

let connections = []

const socketServer = http.createServer(app)
const io = require('socket.io')(socketServer)

const socketPort = 7821

io.listen(socketPort)

// io.on('connection', (socket) => {
//   console.log('connected')
//   console.log(socket)
// })
//
// io.on('disconnect', () => {console.log('disconnected')})

// const io = require('socket.io')(server, {
//   path: '/push',
//   serveClient: true,
//   // below are engine.IO options
//   pingInterval: 10000,
//   pingTimeout: 5000,
//   cookie: false
// })

// Edit to use token.
io.on('connection', async (socket) => {
  let userID = null

  await socket.on('authentication', async (data) => {
    console.log('authentication data: ', data)
    userID = await socketAuthentication(data)
    if(userID === 'unauthorized') {
      socket.emit(userID)

      return userID
    }
  })

  const index = connections.map(c => c.userID).indexOf(userID)

  const connection = {
    userID,
    socket,
  }

  // Still need to check and remove inactive connections.
  if (index !== -1) connections[index] = connection
  else connections[connections.length] = connection

  console.log('user:', userID, 'connected to the server!')
})

io.on('disconnect', userID => {
  const connection = connections.find(c => c.userID === userID)

  if(connection) connection.socket = null

  console.log('user:', userID, 'disconnected from the server.')
})

// This must be imported from somewhere not hardcoded like this(Also change value):
// const conversionKey = '412EAAA9-B925–17DA-31CD-F2AC0C6D5B31'
//
// // Still needs to be implemented use 'crypt' module if
// // bcrypt isint proper for this job.
// const generateAcceptValue = (acceptKey) => {
//   return bcrypt
//     .createHash('sha1')
//     .update(acceptKey + conversionKey, 'binary')
//     .digest('base64')
// }

// Send data to user.
const send = (user, type, data) => {
  // This still needs to be implemented.
  console.log('sending: ', type, data, 'to user:', user)

  const connection = connections.find(c => c.userID === user._id)

  console.log('connections:', connections)
  console.log('connection', connection)

  if (connection) {
    try {
      connection.socket.emit(type, data)
      console.log('SENDING EVENT TROUGH SOCKET: ', type)
      console.log(data)
    } catch (exception) {
      'sending data through socket failed.'
    }
  }
}

// Send data to user if they are not the sender.
const sendIfNotSender = (user, senderID, type, data) => {
  if(!userEqualsUser(user, senderID)) {
    send(user, type, data)
  }
}

// Sends updated event to all participants.
io.updateEvent = async (eventID, senderID) => {
  const event = await Event.findByID(eventID)

  sendIfNotSender(event.creator, senderID, 'updatedEvent', event)

  for (let i = 0; i < event.admins.length; i++) {
    sendIfNotSender(event.admins[i], senderID, 'updatedEvent', event)
  }
  for (let i = 0; i < event.participants.length; i++) {
    sendIfNotSender(event.participants[i], senderID, 'updatedEvent', event)
  }
}

// Sends a new message to all receivers.
io.newMessage = (message) => {
  for (let i = 0; i < message.receivers.length; i++) {
    send(message.receivers[i], 'newMessage', Message.format(message))
  }
}

// Is used in controllers to trigger logic 'events'
module.exports = {
  io
}
