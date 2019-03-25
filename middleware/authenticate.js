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

const requireBoAuthentication = async (req, res, next) => {
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

  const bouser = await BOUser.findById(decodedToken.id)

  if (!bouser) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  res.locals.user = bouser

  next()
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

  if (!user) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  res.locals.user = user

  next()
}

const getTokenFromSocket = (data) => {
  if(data && data.headers && data.headers.Authorization) {
    const authorization = data.headers.Authorization

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
  }

  return null
}

const socketAuthentication = async (socket, data) => {
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

  return decodedToken.id
}

module.exports = {
  requireAuthentication,
  requireBoAuthentication,
  socketAuthentication
}
