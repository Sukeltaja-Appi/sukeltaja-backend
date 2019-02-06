const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
  name: String,
  type: String,
  depth: Number,
  longitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  }
})

locationSchema.statics.format = (location) => {
  return {
    id: location._id,
    type: location.type,
    depth: location.depth,
    longitude: location.longitude,
    latitude: location.latitude
  }
}
const Location = mongoose.model('Location', locationSchema)

module.exports = Location
