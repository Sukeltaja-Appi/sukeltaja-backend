const diveRouter = require('express').Router()
const Dive = require('../models/dive')
const requireAuthentication = require('../middleware/authenticate')
const Event = require('../models/event')
const handleEndDate = require('../middleware/dates')

diveRouter.get('/', async (req, res) => {
  try {
    const dives = await Dive
      .find({})

    res.json(dives.map(Dive.format))
  } catch (exception) {
    console.log(exception)
    
    return res.status(500).json({ error: 'something went wrong...' })
  }

})

diveRouter.all('*', requireAuthentication)

diveRouter.post('/', async (req, res) => {
  try {
    const { startdate, enddate, event, longitude, latitude } = req.body
    const { user } = res.locals

    if (!event || !longitude || !latitude) {
      return res.status(400).json({ error: 'content missing' })
    }

    const dive = new Dive({
      startdate: startdate || new Date(),
      enddate: handleEndDate(startdate || new Date(), enddate),
      event: event.id,
      user: user.id,
      longitude,
      latitude
    })

    const savedDive = await dive.save()

    user.dives = user.dives.concat(savedDive.id)
    await user.save()

    const diveEvent = await Event.findById(event)

    diveEvent.dives = diveEvent.dives.concat(savedDive.id)
    await diveEvent.save()

    res.json(Dive.format(savedDive))

  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = diveRouter