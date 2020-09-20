const mongoose = require('mongoose')

const targetSchema = new mongoose.Schema({
  name: String,
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  type: String,
  depth: String,
  material: String,
  hylyt_id: Number,
  hylyt_link: String,
  mj_id: String,
  mj_link: String,
  user_created: Boolean
})

targetSchema.statics.format = (target) => {
  const { _id, name, latitude, longitude, type, depth, material, hylyt_id, hylyt_link, mj_id, mj_link, user_created } = target

  return {
    _id,
    name,
    latitude,
    longitude,
    type,
    depth,
    material,
    hylyt_id,
    hylyt_link,
    mj_id,
    mj_link,
    user_created
  }
}

const Target = mongoose.model('Target', targetSchema)

module.exports = Target
