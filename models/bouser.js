const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const BOuserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  admin: Boolean
})

BOuserSchema.plugin(uniqueValidator)

BOuserSchema.statics.format = (BOuser) => {
  const { _id, username, admin } = BOuser

  return {
    _id,
    username,
    admin
  }
}
const BOUser = mongoose.model('BOUser', BOuserSchema)

module.exports = BOUser
