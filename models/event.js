const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  description: String,
  startdate: Date,
  enddate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: String,
  dives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dive' }]

})

eventSchema.statics.format = (event) => {
  return {
    id: event._id,
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
