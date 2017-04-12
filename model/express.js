const {Schema} = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const uniqueValidator = require('mongoose-unique-validator')
const qs = require('querystring')

const connection = require('./connection')
const config = require('../config')
const {genPassword, encrypt} = require('../lib/Ecc')

const ExpressSchema = new Schema({
  type: String,
  weight: String,
  receiverPhone: String,
  receiverName: String,
  receiverAddress: String,
  senderPhone: String,
  senderName: String,
  senderAddress: String,
  password: String,
  status: {
    type: String,
    enum: ['initial', 'transfer', 'received']
  },
  history: [{
    operator: {type: Schema.Types.ObjectId, ref: 'User'},
    position: String,
    status: {
      type: String,
      enum: ['initial', 'transfer', 'received']
    }
  }],
  code: String
})

ExpressSchema.statics.addExpress =
  async function addExpress({
    type, weight, receiverPhone, receiverName, receiverAddress,
    senderName, senderPhone, senderAddress
  }) {
    const User = connection.model('User')
    const sender = await User.findEndUser(senderPhone)
    const receiver = await User.findEndUser(receiverPhone)
    const password = genPassword()
    const express = await this.create({
      type, weight, receiverPhone, receiverName, receiverAddress,
      senderName, senderPhone, senderAddress,
      password: genPassword()
    })

    const simpleMessage = qs.stringify({t: type, w: weight, id: express.expressId})
    const expressMessage = encrypt(config.key.publicKey, {
      p: receiverPhone, a: senderAddress, n: senderName
    })
    const passwordMessage = encrypt(receiver.publicKey, {s: password})

    express.code = `${simpleMessage}&${expressMessage}&${passwordMessage}`
    return express.save()
  }

ExpressSchema.plugin(autoIncrement.plugin, {
  model: 'Express',
  field: 'expressId',
  startAt: 1,
  incrementBy: 1
})

const User = connection.model('Express', ExpressSchema)
module.exports = User
