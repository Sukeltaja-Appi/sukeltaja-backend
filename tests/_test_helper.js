const supertest = require('supertest')
const { app } = require('../index')
const api = supertest(app)
const User = require('../src/models/user')
const Event = require('../src/models/event')
const Dive = require('../src/models/dive')
const Target = require('../src/models/target')
const config = require('../src/utils/config')

// Initial objects in DB
const userObject = {
  'username': 'SamiSukeltaja',
  'password': '123123salasana'
}

const userObject2 = {
  'username': 'SepiSukeltaja',
  'password': '123123salasana'
}

const eventObjects = [
  {
    'title': 'Suomen vanhin hylky, huono sää.',
    'startdate': '2019-01-15T13:03:22.014Z',
    '__v': 0,
    'enddate': '2019-01-15T14:12:25.128Z',
    'target': null,
    'dives': []
  }
]

const targetObjects = [
  {
    'name': 'Ruotohylky',
    'type': 'Hylky',
    'depth': '17',
    'latitude': '59.95756592',
    'longitude': '24.37135085'
  }
]

// Functions to initialize DB
const postUser = async () => {
  await api
    .post(`${config.apiUrl}/users`)
    .send(userObject)
    .expect(200)

  await api
    .post(`${config.apiUrl}/users`)
    .send(userObject2)
    .expect(200)

}

const login = async () => {
  let token

  await api
    .post(`${config.apiUrl}/login`)
    .send(userObject)
    .expect(200)
    .then(res => {
      token = res.body.token
    })

  return token
}
const boLogin = async () => {
  let token

  await api
    .post(`${config.apiUrl}/login/bo`)
    .send(userObject)
    .expect(200)
    .then(res => {
      token = res.body.token
    })

  return token
}

const postEvents = async (token) => {
  let event

  await api
    .post(`${config.apiUrl}/events`)
    .set('Authorization', `bearer ${token}`)
    .send(eventObjects[0])
    .expect(200)
    .then(res => {
      event = res.body
    })

  return event
}

const postTargets = async (token) => {
  await api
    .post(`${config.apiUrl}/targets`)
    .set('Authorization', `bearer ${token}`)
    .send(targetObjects[0])
    .expect(200)
}

const postDive = async (user, event, token) => {
  console.log('Posting dive with: ' + user._id)
  const diveObject = {

    'startdate': '2019-01-15T13:03:22.014Z',
    'enddate': '2019-01-15T14:12:25.128Z',
    'event': `${event._id}`,
    'user': `${user._id}`,
    'longitude': '60.5525',
    'latitude': '24.1232',
    '__v': 0
  }

  await api
    .post(`${config.apiUrl}/dives`)
    .set('Authorization', `bearer ${token}`)
    .send(diveObject)
    .expect(200)
}

// Main function
const initializeDb = async () => {
  await User.deleteMany({})
  await Event.deleteMany({})
  await Target.deleteMany({})
  await Dive.deleteMany({})

  await postUser()

  const token = await login()

  const event = await postEvents(token)
  const user = await User.findOne({ username: 'SamiSukeltaja' })

  console.log(user)

  await postTargets(token)

  await postDive(user, event, token)

}

module.exports = { initializeDb, login, boLogin }
