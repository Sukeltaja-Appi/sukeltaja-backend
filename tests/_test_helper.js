const supertest = require('supertest')
const { app } = require('../index')
const api = supertest(app)
const User = require('../models/user')
const Event = require('../models/event')

// Initial objects in DB
const userObject = {
  'username': 'SamiSukeltaja',
  'password': '123123salasana'
}

const eventObjects = [
  { 'content': 'Suomen vanhin hylky, huono sää.' },
]

// Functions to initialize DB
const postUser = async () => {
  await api
    .post('/users')
    .send(userObject)
    .expect(200)
}

const login = async () => {
  let token

  await api
    .post('/login')
    .send(userObject)
    .expect(200)
    .then(res => {
      token = res.body.token
    })

  return token
}

const postEvents = async (token) => {
  await api
    .post('/events')
    .set('Authorization', `bearer ${token}`)
    .send(eventObjects[0])
    .expect(200)
}

// Main function
const initializeDb = async () => {
  await User.deleteMany({})
  await Event.deleteMany({})

  await postUser()

  const token = await login()

  await postEvents(token)
}

module.exports = initializeDb
