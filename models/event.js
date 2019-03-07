const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  startdate: Date,
  enddate: Date,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pending: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    access: String
  }],
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
    creator: event.creator,
    admins: event.admins,
    participants: event.participants,
    pending: event.pending,
    target: event.target,
    dives: event.dives
  }
}
const Event = mongoose.model('Event', eventSchema)

module.exports = Event
