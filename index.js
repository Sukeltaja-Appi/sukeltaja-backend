const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const http = require('http')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const eventRouter = require('./controllers/eventRouter')
const userRouter = require('./controllers/userRouter')
const loginRouter = require('./controllers/loginRouter')

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

mongoose
  .connect(config.mongoUrl)
  .then(() => {
    console.log('connected to databases', config.mongoUrl)
  })
  .catch( err => {
    console.log(err)
  })

app.use(cors())
app.use(bodyParser.json())

app.use(express.static('build'))
app.use(middleware.logger)

app.get('/', (req, res) => {
  res.send('<h1>Hello backend!</h1> <a href="/events">Events</a>')
})
app.use('/events', eventRouter)
app.use('/users', userRouter)
app.use('/login', loginRouter)

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
