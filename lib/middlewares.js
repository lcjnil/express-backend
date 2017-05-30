const User = require('../model/user')
const {decode} = require('../lib/token')
const AppError = require('../lib/AppError')

const isLogin = async (ctx, next) => {
  let userId = null

  const token = ctx.get('X-Access-Token')
  if (token) {
    userId = decode(token).userId
  }

  if (userId) {
    const user = await User.findOne({userId})
    if (user) {
      ctx.user = user
    }
  }

  await next()
}

const isStaff = async (ctx, next) => {
  if (ctx.user && ['staff', 'admin'].includes(ctx.user.type)) {
    await next()
  } else {
    throw new AppError(401, '您没有权限做当前操作')
  }
}

const isAdmin = async (ctx, next) => {
  if (ctx.user && ['admin'].includes(ctx.user.type)) {
    await next()
  } else {
    throw new AppError(401, '您没有权限做当前操作')
  }
}

module.exports = {
  isLogin, isStaff, isAdmin
}
