const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const { ObjectId } = mongoose.Schema.Types

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  startdate: Date,
  enddate: Date,
  creator: { type: ObjectId, ref: 'User' },
  admins: [{ type: ObjectId, ref: 'User', autopopulate: true }],
  participants: [{ type: ObjectId, ref: 'User', autopopulate: true }],
  pending: [{
    user: { type: ObjectId, ref: 'User', autopopulate: true },
    access: String
  }],
  target: { type: ObjectId, ref: 'Target', autopopulate: true },
  dives: [{ type: ObjectId, ref: 'Dive', autopopulate: true }]
})

eventSchema.plugin(autopopulate)

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
