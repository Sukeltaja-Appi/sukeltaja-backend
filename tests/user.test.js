const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const config = require('../utils/config')
const { initializeDb, login } = require('./_test_helper')

let token

beforeAll(async () => {
  await initializeDb()
  token = await login()
})

describe('user tests', async () => {
  test('users are returned as json', async () => {
    await api
      .get(`${config.apiUrl}/users`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('username of the first user is correct', async () => {
    const response = await api
      .get(`${config.apiUrl}/users`)
      .set('Authorization', `bearer ${token}`)

    expect(response.body[0].username).toBe('SamiSukeltaja')
  })
})

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
