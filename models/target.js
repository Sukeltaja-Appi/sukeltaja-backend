const mongoose = require('mongoose')

const targetSchema = new mongoose.Schema({
  name: String,
  type: String,
  depth: Number,
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
})

targetSchema.statics.format = (target) => {
  return {
    id: target._id,
    name: target.name,
    type: target.type,
    depth: target.depth,
    latitude: target.latitude,
    longitude: target.longitude
  }
}
const Target = mongoose.model('Target', targetSchema)

module.exports = Target
