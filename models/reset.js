const mongoose = require('mongoose')

const resetSchema = new mongoose.Schema({
  username: String,
  expireAt: {
    type: Date,
    default: () => Date.now() + 600000
  }
})

resetSchema.statics.format = (reset) => {
  const { _id, username } = reset

  return {
    _id,
    username
  }
}

const Reset = mongoose.model('Reset', resetSchema)

module.exports = Reset