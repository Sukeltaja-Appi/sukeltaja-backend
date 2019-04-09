const mongoose = require('mongoose')

const resetSchema = new mongoose.Schema({
  username: String,
  expireAt: {
    type: Date,
    default: new Date(new Date().valueOf() + 600000),
    index: { expires: 600000 },
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