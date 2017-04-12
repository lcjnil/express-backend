const Router = require('koa-router')
const router = new Router()
const _ = require('lodash')

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

module.exports = router
