const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  content: String,
  startdate: Date,
  enddate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

eventSchema.statics.format = (event) => {
  return{
    id: event._id,
    content: event.content,
    startdate: event.startdate,
    enddate: event.enddate,
    user: event.user
  }
}
const Event = mongoose.model('Event', eventSchema)

module.exports = Event
