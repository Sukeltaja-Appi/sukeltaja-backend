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
const targetRouter = require('./controllers/targetRouter')
const diveRouter = require('./controllers/diveRouter')
const messageRouter = require('./controllers/messageRouter')
const BOuserRouter = require('./controllers/BOuserRouter')
const pwResetRouter = require('./controllers/passwordResetRouter')

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
app.use(express.urlencoded())
app.use(bodyParser.json())

app.use(express.static('build'))
app.use(middleware.logger)

app.get('/api', (req, res) => {
  res.send('<h1>Backend API starts here</h1> ')
})

app.use(`${config.apiUrl}/events`, eventRouter)
app.use(`${config.apiUrl}/users`, userRouter)
app.use(`${config.apiUrl}/login`, loginRouter)
app.use(`${config.apiUrl}/targets`, targetRouter)
app.use(`${config.apiUrl}/dives`, diveRouter)
app.use(`${config.apiUrl}/messages`, messageRouter)
app.use(`${config.apiUrl}/bousers`, BOuserRouter)
app.use(`${config.apiUrl}/reset`, pwResetRouter)

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
  console.log(`API root starts at ${config.apiUrl}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}
