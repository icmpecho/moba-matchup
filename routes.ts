import * as Router from 'koa-router'
const router = new Router()
const apiRouter = new Router()


apiRouter.get('/players', async (ctx) => {
  const players = await ctx.models.player.list(ctx.request.query)
  ctx.body = players
})

apiRouter.post('/players', async (ctx) => {
  const data = ctx.request.body
  const player = await ctx.models.player.create(data.name, data.rating)
  ctx.body = player
})

apiRouter.get('/players/:playerId', async (ctx) => {
  const player = await ctx.models.player.get(ctx.params.playerId)
  ctx.body = await ctx.models.player.enrich(player)
})

apiRouter.get('/games', async (ctx) => {
  const games = await ctx.models.game.list(ctx.request.query)
  ctx.body = games
})

apiRouter.post('/games', async (ctx) => {
  const data = ctx.request.body
  const game = await ctx.models.game.create(data.playerIds)
  ctx.body = await ctx.models.game.enrich(game)
})

apiRouter.get('/games/:gameId', async (ctx) => {
  const game = await ctx.models.game.get(ctx.params.gameId)
  ctx.body = await ctx.models.game.enrich(game)
})

apiRouter.post('/games/:gameId/cancel', async (ctx) => {
  const game = await ctx.models.game.cancel(ctx.params.gameId)
  ctx.body = await ctx.models.game.enrich(game)
})

apiRouter.post('/games/:gameId/submit', async (ctx) => {
  const data = ctx.request.body
  const game = await ctx.models.game.submitResult(
    ctx.params.gameId, data.winner, data.mvps)
  ctx.body = await ctx.models.game.enrich(game)
})

apiRouter.post('/line-webhook', async (ctx) => {
  const headers = ctx.request.headers
  const body = ctx.request.body
  console.log("Line Webhook")
  console.log(`headers: ${headers}`)
  console.log(`body: ${body}`)
})

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods())

export {router}
