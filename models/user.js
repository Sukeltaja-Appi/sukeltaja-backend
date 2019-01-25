const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
})

userSchema.statics.format = (user) => {
  return{
    id: user._id,
    username: user.username,
    password: user.password,
    events: user.events
  }
}
const User = mongoose.model('User', userSchema)

module.exports = User