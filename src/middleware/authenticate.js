const jwt = require('jsonwebtoken')
const User = require('../models/user')
const BOUser = require('../models/bouser')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }

  return null
}

const requireBoAuthentication = asyncRouteWrapper(async (req, res) => {
  if (res.headersSent)
    return

  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const bouser = await BOUser.findById(decodedToken.id)

  if (!bouser) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  res.locals.user = bouser
})

const requireAuthentication = asyncRouteWrapper(async (req, res) => {
  if (res.headersSent)
    return

  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  res.locals.user = user
})

const getTokenFromSocket = (data) => {
  if (data && data.headers && data.headers.Authorization) {
    const authorization = data.headers.Authorization

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
  }

  return null
}

const socketAuthentication = async (data) => {
  const token = getTokenFromSocket(data)

  let decodedToken = null

  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      console.log('JsonWebTokenError')

      return 'unauthorized'
    } else {
      console.log(exception)
      console.log('something went wrong...')

      return
    }
  }

  if (!token || !decodedToken.id) {
    console.log('token missing or invalid')

    return
  }

  console.log('decoded token:', decodedToken)

  return decodedToken.id
}

module.exports = {
  requireAuthentication,
  requireBoAuthentication,
  socketAuthentication
}
