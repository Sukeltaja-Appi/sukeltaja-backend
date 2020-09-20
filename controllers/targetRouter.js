const targetRouter = require('express').Router()
const Target = require('../models/target')
const { requireAuthentication } = require('../middleware/authenticate')
const config = require('../utils/config')

const linkToKyppi = (mj_id) => mj_id ? `${config.kyppiUrl}${mj_id}` : undefined

targetRouter.get('/', async (req, res) => {
  try {
    const targets = await Target
      .find({ user_created: false })

    res.json(targets.map(Target.format))
  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})

// From here on require authentication on all routes.
targetRouter.all('*', requireAuthentication)

targetRouter.post('/', async (req, res) => {
  try {
    const { name, depth, latitude, longitude, hylyt_id, hylyt_link, mj_id, user_created } = req.body

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'coordinates missing' })
    }

    const target = new Target({
      name,
      depth,
      latitude,
      longitude,
      hylyt_id,
      hylyt_link,
      mj_id,
      mj_link: linkToKyppi(mj_id),
      user_created
    })

    const savedTarget = await target.save()

    res.json(Target.format(savedTarget))

  } catch (exception) {
    console.log(exception)

    return res.status(500).json({ error: 'something went wrong...' })
  }
})
module.exports = targetRouter