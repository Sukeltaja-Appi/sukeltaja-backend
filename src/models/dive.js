const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const { ObjectId } = mongoose.Schema.Types

const diveSchema = new mongoose.Schema({
  startdate: Date,
  enddate: Date,
  user: { type: ObjectId, ref: 'User', autopopulate: { select: 'username' } },
  event: { type: ObjectId, ref: 'Event' },
  latitude: Number,
  longitude: Number
})

diveSchema.statics.format = (dive) => {
  const { _id, startdate, enddate, user, event, latitude, longitude } = dive

  return {
    _id,
    startdate,
    enddate,
    user,
    event,
    latitude,
    longitude
  }
}

diveSchema.plugin(autopopulate)

const Dive = mongoose.model('Dive', diveSchema)

module.exports = Dive
