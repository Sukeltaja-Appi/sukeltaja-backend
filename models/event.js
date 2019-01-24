
const mongoose = require('mongoose')


const Event = mongoose.model('Event', {
  content: String,
  startdate: Date,
  enddate: Date,
  user: String
})

module.exports = Event