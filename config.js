const isDebug = process.env.NODE_ENV !== 'production'

module.exports = {
  database: {
    host: isDebug ? 'localhost' : process.env.MONGODB,
    database: 'express',
    port: 27017
  },
  key: {
    privateKey: 'wplSK11hyZsDIoPzR4qwwdS5CJsOY57hw9tzGHXUGX0=',
    publicKey: 'zG/m9vCoqT0X8bWdjj7dctG9pJDt87xTgeIGMXYxvRSE/Ebm+Ef2cNc0hsMqy1jPdy90MOAuG5AlzO92Qc19yg==',
    iv: 'VHyNJpIliCI+Y13Q9y73qQ==',
  }
}
