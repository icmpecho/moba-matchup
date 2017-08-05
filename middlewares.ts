import * as Koa from 'koa'

const errorHandler: Koa.Middleware = async (ctx, next) => {
  try { await next() }
  catch (e) {
    ctx.status = e.status || 500
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({
      error: e.message
    })
    ctx.app.emit('error', e, ctx)
  }
}

export {errorHandler}