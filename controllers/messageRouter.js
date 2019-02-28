const messageRouter = require('express').Router()
const Message = require('../models/message')
const bcrypt = require('bcrypt')
const requireAuthentication = require('../middleware/authenticate')

// Returns all current events from database as JSON
messageRouter.all('*', requireAuthentication)

messageRouter.get('/', async (req, res) => {
    try {
        const messages = await Message
            .find({
                $or: [
                    { 'receievers': { $in: [res.locals.user.id] } }
                ]
            })
            .populate('sender', { username: 1 })


        res.json(messages.map(Message.format))
    } catch (exception) {
        console.log(exception)

        return res.status(500).json({ error: 'something went wrong...' })
    }
})

messageRouter.post('/', async (req, res) => {
    try {
        const { receievers, created, type, data } = req.body
        const { user } = res.locals

        if (!receievers) {
            return res.status(400).json({ error: 'recievers missing' })
        }

        let recieved = []
        for (i = 0; i < receievers.length; i++) recieved.push(false);

        const message = new Message({
            sender: user.id,
            receievers,
            created,
            recieved,
            type,
            data
        })

        const savedMessage = await message.save()

        for (i = 0; i < receievers.length; i++) {
            var reciever = await User.findById(receievers[i])
            receiever.messages = reciever.messages.concat(savedMessage.id)

            await reciever.save()
        }



        console.log(savedMessage)
        res.json(Message.format(savedMessage))

    } catch (exception) {
        console.log(exception)
        res.status(500).json({ error: 'something went wrong...' })
    }
})

module.exports = messageRouter