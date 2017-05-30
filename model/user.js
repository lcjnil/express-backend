const {Schema} = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const uniqueValidator = require('mongoose-unique-validator')

const connection = require('./connection')
const {genKeypair} = require('../lib/Ecc')

const UserSchema = new Schema({
  phone: {
    type: 'string',
    required: '电话是必填项',
    unique: true
  },
  password: {
    type: 'String',
    required: '密码是必填项'
  },
  name: {
    type: 'String'
  },
  type: {
    type: 'String',
    enum: ['user', 'staff', 'admin'],
    default: 'user'
  },
  publicKey: 'String',
  privateKey: 'String'
})

// static functions
UserSchema.statics.addUser = function addUser ({phone, password, type = 'user'}) {
  return this.create({phone, password, type})
}

UserSchema.statics.addNormalUser = function addNormalUser ({phone, password, name}) {
  return this.create(Object.assign({
    phone,
    password,
    name,
    type: 'user'
  }, genKeypair()))
}

UserSchema.statics.addStaff = function addNormalUser ({phone, password, name}) {
  return this.create({
    phone,
    password,
    name,
    type: 'staff'
  })
}

UserSchema.statics.findEndUser = async function findEndUser (phone, name) {
  let user = await this.findOne({phone})
  if (!user) {
    user = await this.addNormalUser({
      phone,
      name,
      password: 'password'
    })
  }
  return user
}

UserSchema.plugin(uniqueValidator, {
  message: '存在同名项 {VALUE}'
})

UserSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'userId',
  startAt: 1,
  incrementBy: 1
})

const User = connection.model('User', UserSchema)
module.exports = User

async function createAdmin() {
  const admin = await User.findOne({type: 'admin'})
  if (!admin) {
    console.log('Admin not found, create default admin')
    await User.create({
      type: 'admin',
      name: 'Admin',
      phone: '88888',
      password: 'password'
    })
  } else {
    console.log(`Admin is ${admin.phone}`)
  }
}

createAdmin()
