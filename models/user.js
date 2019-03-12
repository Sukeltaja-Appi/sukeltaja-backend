const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', autopopulate: true }],
  dives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dive', autopopulate: true }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message', autopopulate: true }]
})

userSchema.plugin(uniqueValidator)

userSchema.statics.format = (user) => {
  const { _id, username, events, dives, messages } = user

  return {
    _id,
    username,
    events,
    dives,
    messages
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User