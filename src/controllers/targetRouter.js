const targetRouter = require('express').Router()
const Target = require('../models/target')
const { requireAuthentication } = require('../middleware/authenticate')
const config = require('../utils/config')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')

const linkToKyppi = (mj_id) => mj_id ? `${config.kyppiUrl}${mj_id}` : undefined

targetRouter.get('/', asyncRouteWrapper(async (req, res) => {
  const targets = await Target
    .find({ user_created: { $ne: true } })

  res.json(targets.map(Target.format))
}))

// From here on require authentication on all routes.
targetRouter.all('*', requireAuthentication)

targetRouter.post('/', asyncRouteWrapper(async (req, res) => {
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
}))

module.exports = targetRouter