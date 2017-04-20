const Router = require('koa-router')
const router = new Router()
const _ = require('lodash')

const AppError = require('../lib/AppError')
const User = require('../model/user')
const Express = require('../model/express')

const {isLogin, isStaff} = require('../lib/middlewares')

router.prefix('/api/express')

router.use(isLogin)
router.post('/', isStaff, async ctx => {
  const {
    type, weight,
    receiverName, receiverPhone, receiverAddress,
    senderName, senderPhone, senderAddress
  } = ctx.request.body

  ctx.response.status = 200

  const express = await Express.addExpress({
    type, weight,
    receiverName, receiverPhone, receiverAddress,
    senderName, senderPhone, senderAddress
  })
  ctx.response.body = express
  ctx.response.status = 200
})

router.get('/', isStaff, async ctx => {
  const express = await Express.find().select('-password')
  ctx.response.body = express
  ctx.response.status = 200
})

router.get('/:expressId', async ctx => {
  const expressId = ctx.params.expressId
  const express = await Express.findOne({expressId}).deepPopulate('history.operator')
  if (!express) {
    ctx.status = 404
    ctx.body = {}
    return
  }

  if (ctx.user && ctx.user.type !== 'user') {
    ctx.body = _.omit(express.toJSON(), ['password', 'code'])
    return
  }

  if (ctx.user && [express.senderPhone, express.receiverPhone].includes(ctx.user.phone)) {
    ctx.body = _.omit(express.toJSON(), ['code'])
    return
  }

  ctx.body = _.pick(express.toJSON(), ['type', 'weight', 'expressId'])
})

router.post('/:expressId/history', isStaff, async ctx => {
  const {expressId} = ctx.params
  const {position} = ctx.request.body

  const express = await Express.findOne({expressId})
  if (!express) {
    throw new AppError(404, '没有找到这个物流记录')
  }

  await express.addHistory({position, user: ctx.user})
  ctx.response.status = 200
})

router.post('/:expressId/receive', isStaff, async ctx => {
  const {password} = ctx.request.body
  const {expressId} = ctx.params
  const express = await Express.findOne({expressId})
  if (!express) {
    throw new AppError(404, '没有找到这个物流记录')
  }

  await express.markReceive({password, user: ctx.user})
  ctx.response.status = 200
})

module.exports = router
