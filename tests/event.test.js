const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const initializeDb = require('./_test_helper')

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
