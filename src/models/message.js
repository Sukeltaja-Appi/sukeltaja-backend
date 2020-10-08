const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const { ObjectId } = mongoose.Schema.Types

const messageSchema = new mongoose.Schema({
  sender: { type: ObjectId, ref: 'User', autopopulate: { select: 'username' } },
  receivers: [{ type: ObjectId, ref: 'User', autopopulate: { select: 'username' } }],
  created: Date,
  received: [String], // status, possible choices:  pending | received | accepted | rejected
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

messageSchema.plugin(autopopulate)

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
