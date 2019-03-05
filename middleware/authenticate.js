const jwt = require('jsonwebtoken')
const User = require('../models/user')
const BOUser = require('../models/bouser')

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }

  return null
}

const requireAuthentication = async (req, res, next) => {
  const token = getTokenFrom(req)
  let decodedToken = null

  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)

      return res.status(500).json({ error: 'something went wrong...' })
    }
  }

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  var bouser

  if (!user) {

    bouser = await BOUser.findById(decodedToken.id)

    if (!bouser) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
  }
  if (!user) {
    res.locals.user = bouser
  } else {
    res.locals.user = user
  }

  next()
}

module.exports = requireAuthentication
