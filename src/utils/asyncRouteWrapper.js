
module.exports = function asyncRequestHandlerWrapper(fn) {
  if (fn.length === 2) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res))
        .then(() => next())
        .catch((err) => next(err))
    }
  } else if (fn.length === 3) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next))
        .catch((err) => next(err))
    }
  }
  throw new Error(`Expected fn to have 2 or 3 arguments but it has ${fn.length}`)
}
