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

describe('event tests', async () => {

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

    expect(response.body[0].description).toBe('Suomen vanhin hylky, huono sää.')
  })

  test('the id of the user of the event can be seen', async () => {
    const user = await api
      .get(`${config.apiUrl}/users`)
      .set('Authorization', `bearer ${token}`)

    const response = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body[0].creator._id).toBe(user.body[0].id)
  })

  test('event can be posted', async () => {
    const newEvent = {

      'description': 'Haikaloja liikkeellä',
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

    const contents = response.body.map(r => r.description)

    expect(contents).toContain('Haikaloja liikkeellä')
  })

  test('event can be modified', async () => {
    const events = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const eventModify = events.body[1]

    eventModify.description = 'Modified content'

    await api
      .put(`${config.apiUrl}/events/${eventModify.id}`)
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
      .get(`${config.apiUrl}/events/${event.id}`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body.description).toBe('Modified content')
  })

  test('event can be deleted', async () => {
    const allEvents = await api
      .get(`${config.apiUrl}/events`)
      .set('Authorization', `bearer ${token}`)

    const event = allEvents.body[1]

    await api
      .delete(`${config.apiUrl}/events/${event.id}`)
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

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
