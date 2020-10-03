
module.exports = function errorHandler(error, request, response, next) {
  if (process.env.NODE_ENV !== 'test')
    console.error(error.message)
  if (!error)
    response.status(500)
  else if (error.name === 'JsonWebTokenError')
    response.status(401).json({ error: error.message })
  else
    response.status(500).json({ error: 'Something went wrong' })
  next()
}