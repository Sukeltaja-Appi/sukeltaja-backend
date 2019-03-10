const supertest = require('supertest')
const { app } = require('../index')
const api = supertest(app)
const User = require('../models/user')
const Event = require('../models/event')
const Dive = require('../models/dive')
const Target = require('../models/target')
const config = require('../utils/config')

// Initial objects in DB
const userObject = {
  'username': 'SamiSukeltaja',
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

const postDive = async (event, token) => {
  const diveObject = {

    'startdate': '2019-01-15T13:03:22.014Z',
    'enddate': '2019-01-15T14:12:25.128Z',
    'event': `${event._id}`,
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

  await postTargets(token)

  await postDive(event, token)

}

module.exports = { initializeDb, login }
