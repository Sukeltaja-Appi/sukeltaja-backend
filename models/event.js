const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  startdate: Date,
  enddate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'Target' },
  dives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dive' }]

})

eventSchema.statics.format = (event) => {
  return {
    id: event._id,
    title: event.title,
    description: event.description,
    startdate: event.startdate,
    enddate: event.enddate,
    user: event.user,
    target: event.target,
    dives: event.dives
  }
}
const Event = mongoose.model('Event', eventSchema)

module.exports = Event
