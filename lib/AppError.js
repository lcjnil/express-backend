function AppError(status = 500, message) {
  if (arguments.length === 1) {
    this.message = status
  } else {
    this.status = status
    this.message = message
  }
}

module.exports = AppError
