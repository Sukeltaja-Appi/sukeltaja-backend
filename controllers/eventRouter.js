const eventRouter = require('express').Router()
const Event = require('../models/event')
const User = require('../models/user')



eventRouter.get('/', async (req, res) => {
  const events = await Event
    .find({})
    .populate('user',{ username: 1 })

  res.json(events.map(Event.format))
})

// Post-calls on /events create a new "Event", and adds it to the database.
eventRouter.post('/', async (req, res) => {
  try{
    console.log(req.body)

    const body = req.body
    if (body.content === undefined){
      return res.status(400).json({ error: 'content missing' })
    }

    const user = await User.findById(body.user)

    const event = new Event({
      content: body.content,
      startdate: new Date(),
      enddate: new Date(),
      user: user._id
    })

    const savedEvent = await event.save()

    user.events = user.events.concat(savedEvent._id)
    await user.save()

    res.json(Event.format(savedEvent))
  } catch (exception) {
    res.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = eventRouter
