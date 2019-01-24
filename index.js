const config = require('./utils/config')
const express = require('express')
const app = express()
const Event = require('./models/event')
const User = require('./models/user')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const eventRouter = require('./controllers/eventRouter')
const userRouter = require('./controllers/userRouter')



mongoose
  .connect(config.mongoUrl,  { useNewUrlParser: true })
  .then( () => {
    console.log('connected to databases', config.mongoUrl)
  })
  .catch( err => {
    console.log(err)
  })

app.use(bodyParser.json())



app.use(express.static('build'))
app.use(middleware.logger)
app.get('/', (req, res) => {
    res.send('<h1>Hello backend!</h1> <a href="/events">Events</a>')
  })
app.use('/events', eventRouter)
app.use('/users', userRouter)

const server = http.createServer(app)

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
  
  server.on('close', () => {
    mongoose.connection.close()
  })
  
  module.exports = {
    app, server
  }

/*
const port = config.port
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
*/


