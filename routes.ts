import * as Router from "koa-router"

export const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = `Hello World!`
})

router.get('/players', async (ctx) => {
  const players = await ctx.models.player.list()
  ctx.body = players
})
