const Event = require('../models/event')

const messageOkToDelete = (message) => {
  return !message.received.includes('pending')
}

const handleMessage = (message) => {
  if (message.type === 'invitation_participant' || message.type === 'invitation_admin') {
    handleInvitation(message)
  }

}
const handleInvitation = async (message) => {
  const event = await Event.findById(message.data._id)
  const accesstype = getAccess(message.type)

  for (let i = 0; i < message.receivers.length; i++) {
    event.pending = event.pending.concat({ user: message.receivers[i], access: accesstype })
  }
  event.save()
}
const getAccess = (type) => {
  if (type === 'invitation_admin') {
    return 'admin'
  } else {
    return 'participant'
  }
}

module.exports = {
  messageOkToDelete,
  handleMessage
}