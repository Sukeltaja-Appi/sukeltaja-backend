const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const { initializeDb, login } = require('./_test_helper')

beforeAll(async () => {
  await initializeDb()
})

describe('event tests', async () => {

  test('events are returned as json', async () => {
    await api
      .get('/events')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('the first event content is correct', async () => {
    const response = await api
      .get('/events')

    expect(response.body[0].content).toBe('Suomen vanhin hylky, huono sää.')
  })

  test('the id of the user of the event can be seen', async () => {
    const user = await api
      .get('/users')

    const response = await api
      .get('/events')

    expect(response.body[0].user._id).toBe(user.body[0].id)
  })

  test('event can be posted', async () => {
    const newEvent = {

      'content': 'Haikaloja liikkeellä',
      'startdate': '2019-02-15T13:03:22.014Z',
      'enddate': '2019-02-15T14:12:25.128Z'

    }

    await api
      .post('/events')
      .set('Authorization', `bearer ${await login()}`)
      .send(newEvent)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/events')

    const contents = response.body.map(r => r.content)

    expect(contents).toContain('Haikaloja liikkeellä')
  })

  test('event can be modified', async () => {
    const events = await api
      .get('/events')

    const eventModify = events.body[1]

    eventModify.content = 'Modified content'

    await api
      .put(`/events/${eventModify.id}`)
      .set('Authorization', `bearer ${await login()}`)
      .send(eventModify)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/events')

    const contents = response.body.map(r => r.content)

    expect(contents).toContain('Modified content')
  })

  test('single event can be seen', async () => {
    const allEvents = await api
      .get('/events')

    const event = allEvents.body[1]

    const response = await api
      .get(`/events/${event.id}`)
      .set('Authorization', `bearer ${await login()}`)

    expect(response.body.content).toBe('Modified content')
  })

  test('the user of the event can be seen', async () => {
    const response = await api
      .get('/events')

    expect(response.body[0].user.username).toBe('SamiSukeltaja')
  })
})

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
