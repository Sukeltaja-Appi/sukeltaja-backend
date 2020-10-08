const pwResetRouter = require('express').Router()
const User = require('../models/user')
const Reset = require('../models/reset')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const config = require('../utils/config')
const asyncRouteWrapper = require('../utils/asyncRouteWrapper')
const { saltRounds } = require('../utils/config')

const htmlForm = (text) => {
  return (`<body>
          <div align="center">
          ${text}
          </div>
          </body>`)
}

pwResetRouter.get('/:id', asyncRouteWrapper(async (req, res) => {
  const reset = await Reset.findById(req.params.id)

  if (!reset) {
    return res.status(404).send(htmlForm('<h2>Linkki on vanhentunut</h2>'))
  }

  res.send(htmlForm(`<h1>Salasanan vaihtaminen</h1>
            <form action="/api/reset/${req.params.id}" method="post">
              Anna uusi salasana:<br>
              <input type="text" name="password">
              <button type="submit">Päivitä</button>
            </form>`))
}))

pwResetRouter.post('/:id', asyncRouteWrapper(async (req, res) => {
  const reset = await Reset.findById(req.params.id)

  if (!reset) {
    return res.status(404).send(htmlForm('<h2>Linkki on vanhentunut<h2>'))
  }
  console.log(req.body.password)
  console.log(reset.username)

  const user = await User.findOne({ username: reset.username }, { username: 1 })
  const passwordHash = await bcrypt.hash(req.body.password, saltRounds)

  await User.findByIdAndUpdate(
    user._id,
    { password: passwordHash },
    { new: true }
  )

  await Reset.findByIdAndDelete(reset._id)

  return res.status(200).send(htmlForm('<h2>Salasanasi on nyt vaihdettu<h2>'))
}))

pwResetRouter.post('/', asyncRouteWrapper(async (req, res) => {
  try {
    const body = req.body

    if (!body.username) {
      return res.status(400).json({ error: 'username missing' })
    }

    const user = await User.findOne({ username: body.username }, { username: 1, email: 1 })

    if (!user) {
      return res.status(401).json({ error: 'username not found' })
    }
    console.log(user)
    console.log(user.email)

    console.log('Sending email to ' + user.username + '`s email: ' + user.email)
    console.log('Sending the resetlink from: ' + config.email)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email,
        pass: config.emailPW
      }
    })
    const reset = new Reset({
      username: user.username
    })

    const createdReset = await reset.save()

    console.log(createdReset)
    const url = `${config.rootUrl}${config.apiUrl}/reset/${createdReset._id}`
    const mailOptions = {
      from: config.email, // sender address
      to: user.email, // list of receivers
      subject: 'Salasanan vaihtopyyntö', // Subject line
      html: `<h1> Hei ${user.username}!</h1>
       <p>Voit vaihtaa salasanasi käyttämällä allaolevaa linkkiä</p>
       <p>Linkki on voimassa 10 minuuttia</p>
       <a href="${url}">${url}</a>`// plain text body
    }

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log(err)
      else
        console.log(info)
    })

    return res.status(200).json({ success: 'Email sent' })
  } catch (exception) {
    console.log(exception)
    if (exception.includes('User validation failed')) {
      return res.status(400).json({ error: 'username not found' })
    } else {
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
}))

module.exports = pwResetRouter