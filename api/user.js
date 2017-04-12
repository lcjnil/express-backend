const Router = require('koa-router')
const router = new Router()

const User = require('../model/user')
const AppError = require('../lib/AppError')

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
router.prefix('/api/user')
router.get('/', async ctx => {
  const user = await User.find()

  ctx.body = user
})

module.exports = router
