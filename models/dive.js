const mongoose = require('mongoose')

const diveSchema = new mongoose.Schema({
  startdate: Date,
  enddate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
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
const Dive = mongoose.model('Dive', diveSchema)

module.exports = Dive