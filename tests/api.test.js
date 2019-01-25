const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)

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

    expect(response.body[0].events[0].content).toBe('Suomen vanhin hylky, huono sää.')
  })

  test('user can have more than one event', async () => {
    const response = await api
      .get('/users')

    expect(response.body[2].events.length).toBe(2)
  })
})
describe('event tests', async () => {


  test('events are returned as json', async () => {
    await api
      .get('/events')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('the first event content is "Suomen vanhin hylky, huono sää"', async () => {
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