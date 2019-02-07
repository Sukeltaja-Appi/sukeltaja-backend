const mongoose = require('mongoose')

const targetSchema = new mongoose.Schema({
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

targetSchema.statics.format = (target) => {
  return {
    id: target._id,
    type: target.type,
    depth: target.depth,
    longitude: target.longitude,
    latitude: target.latitude
  }
}
const Target = mongoose.model('Target', targetSchema)

module.exports = Target
