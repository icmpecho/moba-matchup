import * as Router from "koa-router"
export const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = `Hello World!`
})

router.get('/players', async (ctx) => {
  const players = await ctx.models.player.list()
  ctx.body = players
})

router.post('/players', async (ctx) => {
  const data = ctx.request.body
  const player = await ctx.models.player.create(data.name, data.rating)
  ctx.body = player
})

router.post('/games', async (ctx) => {
  const data = ctx.request.body
  const game = await ctx.models.game.autoCreate(data.playerIds)
  ctx.body = await ctx.models.game.enrich(game)
})
