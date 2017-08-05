import * as Router from "koa-router"
export const router = new Router()
const apiRouter = new Router()


apiRouter.get('/players', async (ctx) => {
  const players = await ctx.models.player.list()
  ctx.body = players
})

apiRouter.post('/players', async (ctx) => {
  const data = ctx.request.body
  const player = await ctx.models.player.create(data.name, data.rating)
  ctx.body = player
})

apiRouter.get('/games', async (ctx) => {
  const games = await ctx.models.game.list()
  ctx.body = games
})

apiRouter.post('/games', async (ctx) => {
  const data = ctx.request.body
  const game = await ctx.models.game.autoCreate(data.playerIds)
  ctx.body = await ctx.models.game.enrich(game)
})

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods())
