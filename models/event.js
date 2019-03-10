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
  const { _id, title, description, startdate, enddate, creator, admins, participants, pending, target, dives } = event

  return {
    _id,
    title,
    description,
    startdate,
    enddate,
    creator,
    admins,
    participants,
    pending,
    target,
    dives
  }
}
const Event = mongoose.model('Event', eventSchema)

module.exports = Event
