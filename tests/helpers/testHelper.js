const User = require('../../models/user')
const Event = require('../../models/event')
const Dive = require('../../models/dive')
const Target = require('../../models/target')
const { initialUsers, initialEvents, initialTargets, initialDives, nonExistingEventId } = require('./initialData')
const { login, post } = require('./helperFunctions')

const [ firstEvent, secondEvent, thirdEvent ] = initialEvents

// Helper functions
const eventsInDb = async () => {
  const events = await Event.find({})

  return events.map(Event.format)
}

const usersInDb = async () => {
  const users = await User.find({})

  return users.map(User.format)
}
const clearDb = async () => {
  await User.deleteMany({})
  await Event.deleteMany({})
  await Target.deleteMany({})
  await Dive.deleteMany({})
}
const getIdFromUsername = async (givenUsername) => {
  const user = await User.findOne({ username: `${givenUsername}` })

  return user._id

}

const postUsers = async () => post.data(Object.values(initialUsers)).toUrl('users').exec()

const postEvents = async () => post.data([firstEvent, secondEvent]).toUrl('events').asUser('SamiSukeltaja').exec()

const postThirdEventAsKalle = async () => post.data(thirdEvent).toUrl('events').asUser('KalleKalastaja').exec()

const postDives = async () => post.data(initialDives).toUrl('dives').asUser('SamiSukeltaja').exec()

const postTargets = async () => post.data(initialTargets).toUrl('targets').asUser('SamiSukeltaja').exec()

const mapEventIdsToDives = (events) => initialDives.map((dive, index) => dive.event = `${events[index]._id}`)

const mapUserIdToDives = (user) => initialDives.map((dive) => dive.user = `${user._id}`)

// Main function
const initializeDb = async () => {
  await clearDb()
  await postUsers()

  const restOfEvents = await postEvents()
  const lastEvent = await postThirdEventAsKalle()
  const user = await User.findOne({ username: 'SamiSukeltaja' })

  mapEventIdsToDives([...restOfEvents, lastEvent])
  mapUserIdToDives(user)

  await postDives()
  await postTargets()
}

module.exports = {
  eventsInDb, initialEvents, initialUsers, initializeDb, nonExistingEventId, usersInDb, login, getIdFromUsername
}
