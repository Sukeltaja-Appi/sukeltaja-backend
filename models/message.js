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
  return {
    id: message._id,
    sender: message.sender,
    receivers: message.receivers,
    created: message.created,
    received: message.received,
    type: message.type,
    data: message.data
  }
}
const Message = mongoose.model('message', messageSchema)

module.exports = Message
