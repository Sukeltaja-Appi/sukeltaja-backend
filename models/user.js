const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: [3, 'minimipituus 3'],
    maxlength: 200
  },
  password: {
    type: String,
    minlength: [6, 'minimipituus 6'],
    maxlength: 200
  },
  events: [{ type: ObjectId, ref: 'Event' }],
  dives: [{ type: ObjectId, ref: 'Dive' }],
  messages: [{ type: ObjectId, ref: 'Message' }],
  email: {
    type: String
    ,
    max: 100,
    validate: {
      validator: function (emailtest) {
        return /^.*@.*/.test(emailtest)
      },
      message: props => `${props.value} muoto x@x.x`
    }
  }
})

userSchema.pre('validate', function () {
  userSchema.plugin(uniqueValidator, { message: 'Käyttäjätunnus on jo käytössä' })
})

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
