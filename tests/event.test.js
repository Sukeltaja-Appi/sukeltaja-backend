const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const { initializeDb, login } = require('./_test_helper')
const config = require('../utils/config')

let token

beforeAll(async () => {
  await initializeDb()
  token = await login()

})

describe('basic event tests', async () => {

  test('events are returned as json', async () => {
    await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('the first event content is correct', async () => {
    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body[0].title).toBe('Suomen vanhin hylky, huono sää.')
  })

  test('the id of the user of the event can be seen', async () => {
    const user = await api
      .get(`${config.apiUrl}/users`)
      .set('Authorization', `bearer ${token}`)

    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body[0].creator._id).toBe(user.body[0]._id)
  })

  test('dives of the event can be seen', async () => {
    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body[0].dives.length).toBe(1)
  })

  test('event can be posted', async () => {
    const newEvent = {

      'title': 'Haikaloja liikkeellä',
      'startdate': '2019-02-15T13:03:22.014Z',
      'enddate': '2019-02-15T14:12:25.128Z',
      'target': null,
      'dives': [],

    }

    await api
      .post(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)
      .send(newEvent)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const contents = response.body.map(r => r.title)

    expect(contents).toContain('Haikaloja liikkeellä')
  })

  test('event can be modified', async () => {
    const events = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const eventModify = events.body[1]

    eventModify.description = 'Modified content'

    await api
      .put(`${config.apiUrl}/events/${eventModify._id}`)
      .set('Authorization', `bearer ${token}`)
      .send(eventModify)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const contents = response.body.map(r => r.description)

    expect(contents).toContain('Modified content')
  })

  test('single event can be seen', async () => {
    const allEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const event = allEvents.body[1]

    const response = await api
      .get(`${config.apiUrl}/events/${event._id}`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body.description).toBe('Modified content')
  })

  test('event can be deleted', async () => {
    const allEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const event = allEvents.body[1]

    await api
      .delete(`${config.apiUrl}/events/${event._id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const restEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    expect(restEvents.body.length).toBe(1)
  })

  test('the user of the event can be seen', async () => {
    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body[0].creator.username).toBe('SamiSukeltaja')
  })
})

describe('more complex event tests', async () => {
  test('creator can set target for new event', async () => {
    const newEvent = {

      'title': 'Haikaloja liikkeellä',
      'startdate': '2019-02-15T13:03:22.014Z',
      'enddate': '2019-02-15T14:12:25.128Z',
      'target': null,
      'dives': [],

    }

    await api
      .post(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)
      .send(newEvent)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const allEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const targets = await api
      .get(`${config.apiUrl}/targets`)

    const target = targets.body[0]
    const event = allEvents.body[1]

    event.target = target

    await api
      .put(`${config.apiUrl}/events/${event._id}`)
      .set('Authorization', `bearer ${token}`)
      .send(event)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get(`${config.apiUrl}/events/${event._id}`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body.target.name).toBe('Ruotohylky')
  })

  test('creator can add dives to the event', async () => {
    const allEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const event = allEvents.body[1]
    const diveObject = {

      'startdate': '2019-03-15T13:03:22.014Z',
      'enddate': '2019-03-15T14:12:25.128Z',
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

    const response = await api
      .get(`${config.apiUrl}/events/${event._id}`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body.dives.length).toBe(1)
  })

  test('creator can invite users to the event', async () => {
    const allEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const event = allEvents.body[1]

    const users = await api
      .get(`${config.apiUrl}/users`)

    const userObject = users.body.filter(user => user.username === 'SepiSukeltaja')

    console.log(userObject[0])

    let message = {
      created: new Date(),
      receivers: [
        userObject[0]._id
      ],
      type: 'invitation_participant',
      data: event
    }

    await api
      .post(`${config.apiUrl}/messages`)
      .set('Authorization', `bearer ${token}`)
      .send(message)
      .expect(200)

    const response = await api
      .get(`${config.apiUrl}/events/${event._id}`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body.pending.length).toBe(1)
  })

  test('invited user can see the invite message', async () => {

    const inviteduser = {
      'username': 'SepiSukeltaja',
      'password': '123123salasana'
    }

    const log = await api
      .post(`${config.apiUrl}/login`)
      .send(inviteduser)
      .expect(200)

    const invUserToken = log.body.token

    const response = await api
      .get(`${config.apiUrl}/messages`)
      .set('Authorization', `bearer ${invUserToken}`)

    expect(response.body.length).toBe(1)
  })
})

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
