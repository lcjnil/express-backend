const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const config = require('../config').database

const connection = mongoose.createConnection(`mongodb://${config.host}/${config.database}`)
autoIncrement.initialize(connection);

module.exports = connection
