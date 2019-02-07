const mongoose = require('mongoose')

const diveSchema = new mongoose.Schema({
  startdate: Date,
  enddate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  longitude: Number,
  latitude: Number
})

diveSchema.statics.format = (dive) => {
  return {
    id: dive._id,
    startdate: dive.startdate,
    enddate: dive.enddate,
    user: dive.user,
    event: dive.event,
    longitude: dive.longitude,
    latitude: dive.latitude
  }
}
const Dive = mongoose.model('Dive', diveSchema)

module.exports = Dive