const Koa = require('koa')
const app = new Koa()
const cors = require('kcors')

const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const AppError = require('./lib/AppError')

const sessionApi = require('./api/session')
const userApi = require('./api/employee')
const expressApi = require('./api/express')

app.use(logger())
app.use(bodyParser())
app.use(cors({
  exposeHeaders: 'X-Access-Token',
}))

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    console.log(e)
    if (e instanceof AppError) {
      ctx.status = e.status
      ctx.body = {
        error: e.message
      }
    }
  }
})

app.use(sessionApi.routes())
  .use(sessionApi.allowedMethods())
  .use(userApi.routes())
  .use(userApi.allowedMethods())
  .use(expressApi.routes())
  .use(expressApi.allowedMethods())

app.listen(3000)
