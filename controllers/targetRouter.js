const targetRouter = require('express').Router()
const Target = require('../models/target')
const requireAuthentication = require('../middleware/authenticate')

targetRouter.get('/', async (req, res) => {
  try {
    const targets = await Target
      .find({})

    res.json(targets.map(Target.format))
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

targetRouter.all('*', requireAuthentication)

targetRouter.post('/', async (req, res) => {
  try {
    const { name, type, depth, latitude, longitude } = req.body

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'coordinates missing' })
    }

    const target = new Target({
      name,
      type,
      depth,
      latitude,
      longitude
    })

    const savedTarget = await target.save()

    res.json(Target.format(savedTarget))

  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})
module.exports = targetRouter