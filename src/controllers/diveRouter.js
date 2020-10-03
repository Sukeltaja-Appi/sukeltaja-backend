const diveRouter = require('express').Router()
const Dive = require('../models/dive')
const User = require('../models/user')
const { requireAuthentication } = require('../middleware/authenticate')
const { userIsInArray } = require('../utils/userHandler')
const { dbObjectsInUse, sleep } = require('./DBSynchronizationController')
const Event = require('../models/event')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')

// From here on require authentication on all routes.
diveRouter.all('*', requireAuthentication)

diveRouter.get('/', asyncRouteWrapper(async (req, res) => {
  const dives = await Dive
    .find({})
    .where('user').equals(res.locals.user.id)

  res.json(dives.map(Dive.format))
}))

diveRouter.post('/', asyncRouteWrapper(async (req, res) => {
  try {
    const { startdate, enddate, event, latitude, longitude } = req.body
    const diveUser = req.body.user
    var { user } = res.locals

    if (!diveUser || !event || !startdate) {
      return res.status(400).json({ error: 'missing fields' })
    }
    if (!user._id.equals(diveUser)) {
      const fetchedEvent = await Event.findById(event)

      if (fetchedEvent.creator._id.equals(user._id)
        || userIsInArray(user, fetchedEvent.admins)) {
        user = await User.findById(diveUser)
      } else {
        return res.status(401).json({ error: 'unauthorized request' })
      }
    }

    const dive = new Dive({
      startdate: startdate || new Date(),
      enddate: enddate,
      event: event,
      user: user._id,
      latitude,
      longitude
    })

    const savedDive = await dive.save()

    user.dives = user.dives.concat(savedDive.id)
    await user.save()

    // FIXME: Either use real transactions or just add the even in atomic db query
    // Synchronized block starts. ---------------------
    while (dbObjectsInUse[event]) await sleep(0.01)
    dbObjectsInUse[event] = true

    const diveEvent = await Event.findById(event)

    diveEvent.dives = diveEvent.dives.concat(savedDive.id)
    await diveEvent.save()

    delete dbObjectsInUse[event]
    // Synchronized block ends. -----------------------

    res.json(Dive.format(savedDive))

    req.io.updateEventAll(savedDive.event)

  } catch (exception) {
    // semaphore reset starts---------------------
    try {
      const { event } = req.body

      delete dbObjectsInUse[event]
    } catch (e) { console.log(e) }
    // semaphore reset ends. ---------------------

    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
}))

diveRouter.delete('/:id', asyncRouteWrapper(async (req, res) => {
  try {
    const dive = await Dive.findById(req.params.id)
    const eventID = dive.event

    await Dive.findByIdAndRemove(req.params.id)

    req.io.updateEventAll(eventID)
    res.status(204).end()
  } catch (exception) {
    res.status(400).send({ error: 'malformatted id' })
  }
}))

diveRouter.put('/:id', asyncRouteWrapper(async (req, res) => {
  const { startdate, enddate, event, latitude, longitude } = req.body

  if (!startdate || !enddate || !event) {
    return res.status(400).json({ error: 'missing fields' })
  }
  const dive = await Dive.findById(req.params.id)
  const diveUser = dive.user
  var { user } = res.locals

  if (!user._id.equals(diveUser._id)) {
    const fetchedEvent = await Event.findById(event)

    if (!fetchedEvent.creator._id.equals(user._id)
      && !userIsInArray(user, fetchedEvent.admins)) {
      return res.status(401).json({ error: 'unauthorized request' })
    }
  }

  const updatedDive = await Dive.findByIdAndUpdate(
    req.params.id,
    { startdate, enddate, event, latitude, longitude },
    { new: true }
  )

  res.json(Dive.format(updatedDive))

  req.io.updateEventAll(updatedDive.event)
}))

module.exports = diveRouter
