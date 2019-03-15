const supertest = require('supertest')
const { app } = require('../../index')
const api = supertest(app)
const config = require('../../utils/config')
const { initialUsers } = require('./initialData')

// Log in and return a token.
const login = async (user) => {
  let token

  await api
    .post(`${config.apiUrl}/login`)
    .send(user)
    .expect(200)
    .then(res => {
      token = res.body.token
    })

  return token
}

// Post an array of data to the backend (optionally) as a user
const post = {
  async exec() {
    let returnables = []

    // wrap the data in an array if it isn't in one already
    const data = Array.isArray(this.payload) ? this.payload : [this.payload]

    const token = this.user ? await login(this.user) : ''

    for (const sendable of data) {
      await api
        .post(this.url)
        .set('Authorization', `bearer ${token}`)
        .send(sendable)
        .expect(200)
        .then(res => {
          returnables = returnables.concat(res.body)
        })
    }

    return returnables.length === 1 ? returnables[0] : returnables
  },

  asUser(username) {
    this.user = initialUsers[username]

    return this
  },

  data(payload) {
    this.payload = payload

    return this
  },

  toUrl(url) {
    this.url = `${config.apiUrl}/${url}`

    return this
  }
}

module.exports = {
  login,
  post
}