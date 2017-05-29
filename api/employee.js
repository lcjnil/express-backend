const Router = require('koa-router')
const router = new Router()

const User = require('../model/user')
const AppError = require('../lib/AppError')

/**
 * @api {post} /api/register 新建新快递员
 * @apiName RegisterUser
 * @apiGroup Session
 *
 *
 * @apiParam {String} email Email of the employee
 * @apiParam {string} name Name of the employee
 * @apiParam {String} password Password of the employee
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
router.prefix('/api/employee')
router.post('/', async ctx => {
  const {phone, password, name} = ctx.request.body
  try {
    const user = await User.addStaff({phone, password, name})
    ctx.response.status = 200
    ctx.response.body = {}
  } catch (e) {
    throw new AppError(401, e.errors[Object.keys(e.errors)[0]].message)
  }
})

module.exports = router
