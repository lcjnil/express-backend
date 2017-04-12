const _ = require('lodash')
const sjcl = require('./sjcl')
const {key} = require('../config')
const qs = require('querystring')


function serializePubKey(pub) {
  return sjcl.codec.base64.fromBits(pub.x.concat(pub.y))
}

function unserializePubKey(pub) {
  return new sjcl.ecc.elGamal.publicKey(
    sjcl.ecc.curves.c256,
    sjcl.codec.base64.toBits(pub)
  )
}

function serializePriKey(sec) {
  return sjcl.codec.base64.fromBits(sec)
}

function unserializePriKey(sec) {
  return new sjcl.ecc.elGamal.secretKey(
    sjcl.ecc.curves.c256,
    sjcl.ecc.curves.c256.field.fromBits(sjcl.codec.base64.toBits(sec))
  )
}

function genKeypair() {
  const pair = sjcl.ecc.elGamal.generateKeys(256)
  const pub = pair.pub.get()
  const sec = pair.sec.get()
  return {
    publicKey: serializePubKey(pub),
    privateKey: serializePriKey(sec),
  }
}

function encrypt(publicKey, message) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message)
  }
  if (typeof publicKey === 'string') {
    publicKey = unserializePubKey(publicKey)
  }

  const cipher = JSON.parse(sjcl.encrypt(publicKey, message, {iv: key.iv}))
  return qs.stringify(_.pick(cipher, ['kemtag', 'ct']))
}

function decrypt(privateKey, message) {
  message = qs.parse(message)

  if (!message.iv) {
    message.iv = key.iv
  }
  message = JSON.stringify(message)
  if (typeof privateKey === 'string') {
    privateKey = unserializePriKey(privateKey)
  }

  return sjcl.decrypt(privateKey, message)
}

function genPassword() {
  return ('000000' + Math.floor(Math.random() * 1000000).toString()).substr(-6)
}


module.exports = {
  genKeypair, genPassword,
  encrypt, decrypt,
}
