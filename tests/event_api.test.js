
const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)

test('notes are returned as json', async () => {
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

afterAll(() => {
  server.close()
})

