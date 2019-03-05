const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  dives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dive' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
})

userSchema.plugin(uniqueValidator)

userSchema.statics.format = (user) => {
  return {
    id: user._id,
    username: user.username,
    events: user.events,
    dives: user.dives,
    messages: user.messages
  }
}
const User = mongoose.model('User', userSchema)

module.exports = User