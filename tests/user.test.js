const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const config = require('../utils/config')
const { initialUsers, initializeDb, usersInDb, login } = require('./helpers/testHelper.js')

let token, initialUsernames

beforeAll(async () => {
  await initializeDb()
  token = await login(initialUsers.SamiSukeltaja)
  initialUsernames = Object.values(initialUsers).map(u => u.username)
}, 30000)

describe('User', async () => {

  describe('with valid parameters', async () => {
    test('all users are returned', async () => {
      const response = await api
        .get(`${config.apiUrl}/users`)
        .set('Authorization', `bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usernames = response.body.map(r => r.username)

      expect(response.body.length).toBe(2)
      expect(usernames).toContain(initialUsernames[0])
      expect(usernames).toContain(initialUsernames[1])
    })

    test('a single user can be returned', async () => {
      const users = await usersInDb()

      const { _id } = users[0]

      const response = await api
        .get(`${config.apiUrl}/users/${_id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.username).toBe(users[0].username)
    })

    test('a new user can be posted', async () => {
      const usersAtStart = await usersInDb()

      const newUser = {
        username: 'MeriMies',
        password: '123123Salasana',
        email: 'eitoimiva@email.com'
      }

      await api
        .post(`${config.apiUrl}/users`)
        .set('Authorization', `bearer ${token}`)
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await usersInDb()

      expect(usersAfterOperation.length).toEqual(usersAtStart.length + 1)

      const usernames = usersAfterOperation.map(u => u.username)

      expect(usernames).toContain(newUser.username)
    })
  })

  describe('with invalid username', async () => {
    test('a new user cannot be posted', async () => {
      const usersAtStart = await usersInDb()

      const newUser = {
        username: '',
        password: '123123Salasana',
        email: 'eitoimiva@email.com'
      }

      await api
        .post(`${config.apiUrl}/users`)
        .set('Authorization', `bearer ${token}`)
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await usersInDb()

      expect(usersAtStart).toEqual(usersAfterOperation)
    })

    test('a user with an existing username cannot be posted', async () => {
      const usersAtStart = await usersInDb()

      const newUser = {
        username: 'KalleKalastaja',
        password: '234234Salasana',
        email: 'eitoimiva@email.com'
      }

      await api
        .post(`${config.apiUrl}/users`)
        .set('Authorization', `bearer ${token}`)
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await usersInDb()

      expect(usersAtStart).toEqual(usersAfterOperation)
    })
  })

  describe('with invalid password', async () => {
    test('a new user cannot be posted', async () => {
      const usersAtStart = await usersInDb()

      const newUser = {
        username: 'JoukoJäämies',
        password: '',
        email: 'eitoimiva@email.com'
      }

      await api
        .post(`${config.apiUrl}/users`)
        .set('Authorization', `bearer ${token}`)
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await usersInDb()

      expect(usersAtStart).toEqual(usersAfterOperation)
    })
  })
})

afterAll(async () => {
  await server.close()
  console.log('closed server')
})
