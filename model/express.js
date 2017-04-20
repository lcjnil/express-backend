const mongoose = require('mongoose')
const {Schema} = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const uniqueValidator = require('mongoose-unique-validator')
const deepPopulate = require('mongoose-deep-populate')(mongoose)
const AppError = require('../lib/AppError')

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
    enum: ['initial', 'transfer', 'received'],
    default: 'initial'
  },
  history: [{
    operator: {type: Schema.Types.ObjectId, ref: 'User'},
    position: String,
    date: {type: Date, default: Date.now}
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
      p: receiverPhone, a: receiverAddress, n: receiverName
    })
    const passwordMessage = encrypt(receiver.publicKey, {s: password})

    express.code = `${simpleMessage}&${expressMessage}&${passwordMessage}`
    return express.save()
  }

ExpressSchema.methods.addHistory = async function ({position, user}) {
  if (this.status === 'received') {
    throw new AppError(401, '已经接受的物流不能添加记录')
  }

  this.history.push({
    position,
    operator: user._id
  })

  this.status = 'transfer'
  await this.save()
}

ExpressSchema.methods.markReceive = async function ({password, user}) {
  if (password !== this.password) {
    throw new AppError(401, '确认收货密码有误')
  }

  if (this.status === 'received') {
    throw new AppError(401, '已经确认收货，请勿重复操作')
  }

  this.status = 'received'
  this.history.push({
    position: this.receiverAddress,
    operator: user._id
  })
  await this.save()
}

ExpressSchema.plugin(autoIncrement.plugin, {
  model: 'Express',
  field: 'expressId',
  startAt: 1,
  incrementBy: 1
})

ExpressSchema.plugin(deepPopulate, {
  populate: {
    'history.operator': {
      select: 'phone name'
    }
  }
})

const User = connection.model('Express', ExpressSchema)
module.exports = User
