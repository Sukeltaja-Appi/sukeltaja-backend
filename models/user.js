const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  events: [{ type: ObjectId, ref: 'Event' }],
  dives: [{ type: ObjectId, ref: 'Dive' }],
  messages: [{ type: ObjectId, ref: 'Message' }]
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