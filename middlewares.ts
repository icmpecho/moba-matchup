import * as Koa from 'koa'
import {MongoError} from 'mongodb'
import {ModelNotFoundError} from './models/error'

const mapStatus = (e: any): number => {
  if(e instanceof MongoError) {
    if(e.code == 11000) {
      return 400
    }
  } else if(e instanceof ModelNotFoundError) {
    return 404
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