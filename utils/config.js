if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let mongoUrl = process.env.MONGODB_URI
let kyppiUrl = process.env.KYPPI_URL

let apiUrl = process.env.API_URL

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
  mongoUrl = process.env.TEST_MONGODB_URI
}

module.exports = {
<<<<<<< HEAD
  apiUrl,
=======
  kyppiUrl,
>>>>>>> master
  mongoUrl,
  port
}
