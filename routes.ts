import * as Router from "koa-router"

export const router = new Router()

router.get('/', (ctx) => {
  ctx.body = 'Hello World!'
})
