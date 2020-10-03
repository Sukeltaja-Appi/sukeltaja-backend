const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const { ObjectId } = mongoose.Schema.Types

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  startdate: Date,
  enddate: Date,
  creator: { type: ObjectId, ref: 'User', autopopulate: { select: 'username' } },
  admins: [{ type: ObjectId, ref: 'User', autopopulate: { select: 'username' } }],
  participants: [{ type: ObjectId, ref: 'User', autopopulate: { select: 'username' } }],
  pending: [{
    user: { type: ObjectId, ref: 'User', autopopulate: { select: 'username' } },
    access: String
  }],
  target: { type: ObjectId, ref: 'Target', autopopulate: true },
  dives: [{ type: ObjectId, ref: 'Dive', autopopulate: { select:
     ['user', 'startdate', 'enddate', 'latitude', 'longitude'] } }],
  eventMessages: [{ type: ObjectId, ref: 'EventMessage', autopopulate: { select:
     ['user', 'created', 'text'] } }]
})

eventSchema.statics.format = (event) => {
  const {
    _id, title, description, startdate, enddate,
    creator, admins, participants, pending, target,
    dives, eventMessages
  } = event

  return {
    _id,
    title,
    description,
    startdate,
    enddate,
    creator,
    admins: admins.toObject(),
    participants: participants.toObject(),
    pending: pending.toObject(),
    target,
    dives: dives.toObject(),
    eventMessages: eventMessages.toObject()
  }
}

eventSchema.plugin(autopopulate)

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
