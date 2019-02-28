const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receievers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created: Date,
  recieved: [Boolean],
  type: String,
  data: {}

})

messageSchema.statics.format = (message) => {
  return {
    id: message._id,
    sender: message.sender,
    receievers: message.receievers,
    created: message.created,
    recieved: message.recieved,
    type: message.type,
    data: message.data
  }
}
const Message = mongoose.model('message', messageSchema)

module.exports = Message