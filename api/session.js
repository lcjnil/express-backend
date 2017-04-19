const Router = require('koa-router')
const router = new Router()
const _ = require('lodash')

const User = require('../model/user')
const AppError = require('../lib/AppError')
const {sign} = require('../lib/token')
const {key} = require('../config')

router.prefix('/api')

/**
 * @api {post} /register 注册新用户
 * @apiName RegisterUser
 * @apiGroup Session
 *
 *
 * @apiParam {String} email Email of the user
 * @apiParam {String} password Password of the user
 * @apiParamExample {json} Request-Example
 *   {
 *      "email": "emlcjnil@gmail.com",
 *      "password": "whatdoesfoxsay"
 *   }
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {}

 */
router.post('/register', async ctx => {
  const {phone, password} = ctx.request.body
  try {
    const user = await User.addNormalUser({phone, password})
    ctx.response.status = 200
    ctx.response.body = _.pick(user.toJSON(), ['phone', 'privateKey', 'type'])
  } catch (e) {
    throw new AppError(401, e.errors[Object.keys(e.errors)[0]].message)
  }
})

router.post('/login', async ctx => {
  const {phone, password} = ctx.request.body
  if (!phone || !password) {
    throw new AppError(401, '电话号码或密码不能为空')
  }
  try {
    const user = await User.findOne({phone, password})
    if (user) {
      ctx.response.status = 200
      ctx.response.body = _.pick(user.toJSON(), ['phone', 'privateKey', 'type'])
      if (user.type !== 'user') {
        ctx.response.body.privateKey = key.privateKey
      }
      ctx.set('X-Access-Token', sign(user.userId))
    } else {
      throw new AppError(401, '请检查用户名或密码')
    }
  } catch (e) {
    console.log(e)
    throw new AppError(401, e.errors[Object.keys(e.errors)[0]].message)
  }

})

module.exports = router
