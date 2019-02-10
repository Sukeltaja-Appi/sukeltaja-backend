const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const { initializeDb } = require('./_test_helper')

beforeAll(async () => {
  await initializeDb()
})

describe('user tests', async () => {
  test('users are returned as json', async () => {
    await api
      .get('/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('username of the first user is correct', async () => {
    const response = await api
      .get('/users')

    expect(response.body[0].username).toBe('SamiSukeltaja')
  })

  test('content of the events of the user can be seen', async () => {
    const response = await api
      .get('/users')

    expect(response.body[0].events[0].description).toBe('Suomen vanhin hylky, huono sää.')
  })

  test('content of the dives of the user can be seen', async () => {
    const response = await api
      .get('/users')

    expect(response.body[0].dives[0].longitude).toBe(60.5525)
  })
})

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
