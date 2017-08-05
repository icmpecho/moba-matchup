import * as Koa from 'koa'

const mapStatus = (e: any): number => {
  if(e.code == 11000) {
    return 400
  }
  return 500
}

const errorHandler: Koa.Middleware = async (ctx, next) => {
  try { await next() }
  catch (e) {
    ctx.status = e.status || mapStatus(e)
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({
      error: e.message
    })
    ctx.app.emit('error', e, ctx)
  }
}

const spaHandler: Koa.Middleware = async (ctx) => {
  ctx.body = 'Hello world'
}

export {errorHandler, spaHandler}