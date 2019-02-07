const targetRouter = require('express').Router()
const Target = require('../models/target')
const requireAuthentication = require('../middleware/authenticate')

targetRouter.all('*', requireAuthentication)

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

module.exports = targetRouter