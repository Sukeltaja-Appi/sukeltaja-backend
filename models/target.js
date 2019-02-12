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
  },
  hylyt_id: Number,
  hylyt_link: String,
  mj_id: String,
  mj_link: String
})

targetSchema.statics.format = (target) => {
  return {
    id: target._id,
    name: target.name,
    type: target.type,
    depth: target.depth,
    latitude: target.latitude,
    longitude: target.longitude,
    hylyt_id: target.hylyt_id,
    hylyt_link: target.hylyt_link,
    mj_id: target.mj_id,
    mj_link: target.mj_link
  }
}
const Target = mongoose.model('Target', targetSchema)

module.exports = Target
