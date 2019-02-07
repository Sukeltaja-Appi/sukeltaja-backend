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
  return {
    id: dive._id,
    startdate: dive.startdate,
    enddate: dive.enddate,
    user: dive.user,
    event: dive.event,
    latitude: dive.latitude,
    longitude: dive.longitude
  }
}
const Dive = mongoose.model('Dive', diveSchema)

module.exports = Dive