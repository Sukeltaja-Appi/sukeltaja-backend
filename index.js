require('dotenv').config()
const express = require('express')
const app = express()
const Event = require('./models/event')
const User = require('./models/user')
const bodyParser = require('body-parser')

app.use(bodyParser.json())


const formatEvent = (event) => {
    const formattedEvent = {...event._doc, id: event._id}
    delete formattedEvent._id
    delete formattedEvent.__v
    
    return formattedEvent
}

const formatUser = (user) => {
    const formattedUser = {...user._doc, id: user._id}
    delete formattedUser._id
    delete formattedUser.__v
    
    return formattedUser
}


app.get('/', (req, res) => {
    res.send('<h1>Hello backend!</h1> <a href="/events">Events</a>')
})

// Returns all current events from database as JSON
app.get('/events', (req, res) => {

    Event
    .find({})
    .then(events => {
        res.json(events.map(formatEvent))
    })
  })

// Post-calls on /events create a new "Event", and add's it to the database.
app.post('/events', (req, res) => {
    console.log(req.body);
    
    const body = req.body

    if (body.content === undefined){
        return res.status(400).json({error: 'content missing'})
    }

    const event = new Event({
        content: body.content,
        startdate: new Date(),
        enddate: new Date(),
        user: body.user
    })

    event
    .save()
    .then(savedEvent => {
        res.json(formatEvent(savedEvent))
    })
})

app.get('/users', (req, res) => {

    User
    .find({})
    .then(users => {
        res.json(users.map(formatUser))
    })
  })

  app.post('/users', (req, res) => {
    console.log(req.body);
    
    const body = req.body

    if (body.username === undefined || body.password === undefined){
        return res.status(400).json({error: 'user or password missing'})
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

const port = 3001
app.listen(port)
console.log(`Server running on port ${port}`)