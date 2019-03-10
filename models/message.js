const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created: Date,
  received: [String], // status, possible choises:  pending | receieved | accepted | rejected
  type: String,
  data: {}
})

messageSchema.statics.format = (message) => {
  const { _id, sender, receivers, created, received, type, data } = message

  return {
    _id,
    sender,
    receivers,
    created,
    received,
    type,
    data
  }
}
const Message = mongoose.model('message', messageSchema)

module.exports = Message
