const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url,  { useNewUrlParser: true })

const User = mongoose.model('User', {
  username: String,
  password: String,
  events: {
      String
  }
})

module.exports = User