const Router = require('koa-router')
const router = new Router()
const _ = require('lodash')

const AppError = require('../lib/AppError')
const User = require('../model/user')
const Express = require('../model/express')

const {isLogin, isStaff} = require('../lib/middlewares')

router.prefix('/api/express')
router.use(isLogin)


/**
 * @api {post} /api/express 新建快递单
 * @apiName CreateExpress
 * @apiGroup Express
 *
 *
 * @apiParam {String} type Type of the express
 * @apiParam {String} weight Weight of the express
 * @apiParam {String} receiverName ReceiverName of the express
 * @apiParam {String} receiverPhone ReceiverPhone of the express
 * @apiParam {String} receiverAddress ReceiverAddress of the express
 * @apiParam {String} senderName SenderName of the express
 * @apiParam {String} senderPhone SenderPhone of the express
 * @apiParam {String} senderAddress SenderAddress of the express
 * @apiParamExample {json} Request-Example
 *    {
 *      "type": "书本",
 *      "weight": "15",
 *      "receiverName": "李嘉诚",
 *      "receiverPhone": "13111111111",
 *      "receiverAddress": "这是一个很长很长的地址呢",
 *      "senderName": "啦啦啦",
 *      "senderPhone": "11111111111",
 *      "senderAddress": "组撒的方式登记法律上的考虑烦死了都"
 *    }
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {}
 */
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


/**
 * @api {get} /api/express 获取所有快递单
 * @apiName GetExpresses
 * @apiGroup Express
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    [{
 *      "type": "书本",
 *      "weight": "15",
 *      "receiverName": "李嘉诚",
 *      "receiverPhone": "13111111111",
 *      "receiverAddress": "这是一个很长很长的地址呢",
 *      "senderName": "啦啦啦",
 *      "senderPhone": "11111111111",
 *      "senderAddress": "组撒的方式登记法律上的考虑烦死了都"
 *    }]
 *
 */
router.get('/', isStaff, async ctx => {
  const express = await Express.find().select('-password')
  ctx.response.body = express
  ctx.response.status = 200
})

/**
 * @api {get} /api/express/:expressId 获取某个快递单
 * @apiName GetExpress
 * @apiGroup Express
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "type": "书本",
 *      "weight": "15",
 *      "receiverName": "李嘉诚",
 *      "receiverPhone": "13111111111",
 *      "receiverAddress": "这是一个很长很长的地址呢",
 *      "senderName": "啦啦啦",
 *      "senderPhone": "11111111111",
 *      "senderAddress": "组撒的方式登记法律上的考虑烦死了都"
 *    }
 *
 */
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


/**
 * @api {get} /api/express/:expressId 新建快递单历史路径
 * @apiName CreateExpressHistory
 * @apiGroup Express
 *
 * @apiParam {string} position Position of the express
 * @apiParamExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "position": "???????"
 *    }
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {}
 */
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

/**
 * @api {get} /api/express/:expressId 确认收货
 * @apiName MarkExpressReceive
 * @apiGroup Express
 *
 * @apiParam {string} position Position of the express
 * @apiParamExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "password": "123456"
 *    }
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {}
 */
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
