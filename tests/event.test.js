const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const config = require('../utils/config')
const { eventsInDb, initializeDb, login } = require('./helpers/testHelper')
const { initialEvents, initialUsers } = require('./helpers/initialData')

let token, eventsAtStart, anothersEvent

beforeAll(async () => {
  await initializeDb()
  token = await login(initialUsers.SamiSukeltaja)
})

beforeEach(async () => {
  eventsAtStart = await eventsInDb()
})

describe('Event', async () => {

  describe('an authorized user', async () => {

    beforeAll(async () => {
      const events = await eventsInDb()

      anothersEvent = events[2]
    })

    test('cannot retrieve anothers event', async () => {
      await api
        .get(`${config.apiUrl}/events/${anothersEvent._id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('cannot modify anothers event', async () => {
      const initialTitles = eventsAtStart.map(e => e.title)

      anothersEvent.title = 'Muokattu otsikko, joka epäonnistuu'

      await api
        .put(`${config.apiUrl}/events/${anothersEvent._id}`)
        .set('Authorization', `bearer ${token}`)
        .send(anothersEvent)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      const titles = eventsAfterOperation.map(e => e.title)

      expect(initialTitles).toEqual(titles)
    })

    // TODO: FIX users being able to delete events they don't own
    test('cannot delete anothers event', async () => {
      await api
        .delete(`${config.apiUrl}/events/${anothersEvent._id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })

    test('can retrieve all events they have created', async () => {
      const response = await api
        .get(`${config.apiUrl}/events`)
        .set('Authorization', `bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const creators = response.body.map(r => r.creator.username)

      expect(response.body.length).toBe(2)
      expect(creators).not.toContain('KalleKalastaja')
    })

    test('can retrieve a single event they have created', async () => {
      const { _id } = eventsAtStart[1]

      const response = await api
        .get(`${config.apiUrl}/events/${_id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.title).toEqual(initialEvents[1].title)
    })

    test('can post a new event', async () => {
      const newEvent = {
        'title': 'Haikaloja liikkeellä',
        'startdate': '2019-02-15T13:03:22.014Z',
        'enddate': '2019-02-15T14:12:25.128Z',
        'target': null,
        'dives': []
      }

      await api
        .post(`${config.apiUrl}/events`)
        .set('Authorization', `bearer ${token}`)
        .send(newEvent)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAfterOperation.length).toBe(eventsAtStart.length + 1)

      const titles = eventsAfterOperation.map(e => e.title)

      expect(titles).toContain(newEvent.title)
    })

    test('can modify their own event', async () => {
      const event = eventsAtStart[1]
      const initialTitle = event.title

      event.title = 'Muokattu otsikko, joka onnistuu'

      await api
        .put(`${config.apiUrl}/events/${event._id}`)
        .set('Authorization', `bearer ${token}`)
        .send(event)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      const titles = eventsAfterOperation.map(e => e.title)

      expect(titles).toContain(event.title)
      expect(titles).not.toContain(initialTitle)
    })

    test('can delete their own event', async () => {
      const event = eventsAtStart[1]

      await api
        .delete(`${config.apiUrl}/events/${event._id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAfterOperation.length).toBe(eventsAtStart.length - 1)

      const titles = eventsAfterOperation.map(e => e.title)

      expect(titles).not.toContain(event.title)
    })
  })

  describe('an unauthorized user', async () => {
    test('cannot retrieve all events', async () => {
      await api
        .get(`${config.apiUrl}/events`)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('cannot retrieve a single event', async () => {
      const events = await eventsInDb()

      const { _id } = events[0]

      await api
        .get(`${config.apiUrl}/events/${_id}`)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })

    test('cannot post a new event', async () => {
      const newEvent = {
        'title': 'Suuri merisukellus',
        'startdate': '2019-02-15T13:03:22.014Z',
        'enddate': '2019-02-15T14:12:25.128Z',
        'target': null,
        'dives': []
      }

      const eventsAtStart = await eventsInDb()

      await api
        .post(`${config.apiUrl}/events`)
        .send(newEvent)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })

    test('cannot modify an existing event', async () => {
      const event = eventsAtStart[0]

      const initialTitles = eventsAtStart.map(e => e.title)

      event.title = 'Muokattu epäonnistuva otsikko'

      await api
        .put(`${config.apiUrl}/events/${event._id}`)
        .send(event)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      const titles = eventsAfterOperation.map(e => e.title)

      expect(initialTitles).toEqual(titles)
    })

    test('cannot delete an existing event', async () => {
      const event = eventsAtStart[0]

      await api
        .delete(`${config.apiUrl}/events/${event._id}`)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })
  })

  // // TODO: FIX proper status codes
  /*
  describe('status codes', async () => {
    test('(404) GET nonexisting valid id', async () => {
      await api
        .get(`${config.apiUrl}/events/${nonExistingEventId}`)
        .set('Authorization', `bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/)
    })

    test('(400) GET invalid id', async () => {
      await api
        .get(`${config.apiUrl}/events/1`)
        .set('Authorization', `bearer ${token}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })

    test('(404) PUT nonexisting valid id', async () => {
      await api
        .put(`${config.apiUrl}/events/${nonExistingEventId}`)
        .set('Authorization', `bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })

    test('(400) PUT invalid id', async () => {
      await api
        .get(`${config.apiUrl}/events/1`)
        .set('Authorization', `bearer ${token}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })

    test('(404) DELETE nonexisting valid id', async () => {
      await api
        .delete(`/events/${nonExistingEventId}`)
        .set('Authorization', `bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })

    test('(400) DELETE invalid id', async () => {
      await api
        .delete(`${config.apiUrl}/events/1`)
        .set('Authorization', `bearer ${token}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const eventsAfterOperation = await eventsInDb()

      expect(eventsAtStart).toEqual(eventsAfterOperation)
    })
  })*/
})

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
