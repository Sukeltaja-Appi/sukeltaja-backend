
//This creates a connection to the database, MONGODB_URI from .env file
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url,  { useNewUrlParser: true })

const Event = mongoose.model('Event', {
  content: String,
  startdate: Date,
  enddate: Date,
  user: String
})

module.exports = Event