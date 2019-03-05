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
  return {
    id: BOuser._id,
    username: BOuser.username,
    admin: BOuser.admin
  }
}
const BOUser = mongoose.model('BOUser', BOuserSchema)

module.exports = BOUser
