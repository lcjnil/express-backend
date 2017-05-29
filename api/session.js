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
 *      "password": "whatdoesfoxsay",
 *      "name": "lcj"
 *   }
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {}
 */
router.post('/register', async ctx => {
  const {phone, password, name} = ctx.request.body
  try {
    const user = await User.addNormalUser({phone, password, name})
    ctx.response.status = 200
    ctx.response.body = {}
  } catch (e) {
    throw new AppError(401, e.errors[Object.keys(e.errors)[0]].message)
  }
})

/**
 * @api {post} /api/login 登录
 * @apiName Login
 * @apiGroup Session
 *
 *
 * @apiParam {String} email Email of the user
 * @apiParam {String} password Password of the user
 *   {
 *      "email": "emlcjnil@gmail.com",
 *      "password": "whatdoesfoxsay"
 *   }
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "phone": "13122221111",
 *      "type": "user",
 *      "name": "lcj",
 *      "privateKey": "wplSK11hyZsDIoPzR4qwwdS5CJsOY57hw9tzGHXUGX0"
 *    }
 */
router.post('/login', async ctx => {
  const {phone, password} = ctx.request.body
  if (!phone || !password) {
    throw new AppError(401, '电话号码或密码不能为空')
  }
  try {
    const user = await User.findOne({phone, password})
    if (user) {
      ctx.response.status = 200
      ctx.response.body = _.pick(user.toJSON(), ['phone', 'privateKey', 'type', 'name'])
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
