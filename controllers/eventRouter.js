const eventRouter = require('express').Router()
const Event = require('../models/event')


const formatEvent = (event) => {
    const formattedEvent = {...event._doc, id: event._id }
    delete formattedEvent._id
    delete formattedEvent.__v
  
    return formattedEvent
  }


  eventRouter.get('/', (req, res) => {
    console.log(res.json)
    Event
      .find({})
      .then(events => {
        res.json(events.map(formatEvent))
      })
  })
  
  // Post-calls on /events create a new "Event", and add's it to the database.
  eventRouter.post('/', (req, res) => {
    console.log(req.body)
  
    const body = req.body
  
    if (body.content === undefined){
      return res.status(400).json({ error: 'content missing' })
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

  module.exports = eventRouter