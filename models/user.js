const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: String,
  password: String,
  events: {
    String
  }
})

module.exports = User