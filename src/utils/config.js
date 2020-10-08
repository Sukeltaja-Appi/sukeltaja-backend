if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let mongoUrl = process.env.MONGODB_URI
let kyppiUrl = process.env.KYPPI_URL
let apiUrl = process.env.API_URL
let rootUrl = process.env.ROOT_URL

let email = process.env.SERVICE_EMAIL
let emailPW = process.env.SERVICE_EMAIL_PASSWORD

let validation = {
  usernameLength: {
    min: process.env.NODE_ENV === 'development' ? 0 : 3,
    max: 200,
  },
  passwordLength: {
    min: process.env.NODE_ENV === 'development' ? 0 : 6,
    max: 200,
  },
}

let saltRounds = 10

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
  mongoUrl = process.env.TEST_MONGODB_URI
}

module.exports = {
  apiUrl,
  kyppiUrl,
  mongoUrl,
  port,
  email,
  emailPW,
  rootUrl,
  validation,
  saltRounds,
}
