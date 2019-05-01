const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const { ObjectId } = mongoose.Schema.Types

const eventMessageSchema = new mongoose.Schema({
  text: String,
  created: Date,
  user: { type: ObjectId, ref: 'User', autopopulate: { select: 'username' } },
  event: { type: ObjectId, ref: 'Event' },
})

eventMessageSchema.statics.format = (eventMessage) => {
  const { _id, text, created, user, event } = eventMessage

  return {
    _id,
    text,
    created,
    user,
    event
  }
}

eventMessageSchema.plugin(autopopulate)

const EventMessage = mongoose.model('EventMessage', eventMessageSchema)

module.exports = EventMessage
