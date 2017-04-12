const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const config = require('../config').database

const connection = mongoose.createConnection(`mongodb://localhost/${config.database}`)
autoIncrement.initialize(connection);

module.exports = connection
