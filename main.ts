import * as zlib from 'zlib'
import * as Koa from 'koa'
import * as compress from 'koa-compress'
import * as mount from 'koa-mount'
import * as serve from 'koa-static'
import * as bodyParser from 'koa-bodyparser'
import {router} from './routes'
import {errorHandler, spaHandler} from './middlewares'
import {Service as ModelService} from './models'
import {MongoClient, Db} from 'mongodb'

declare module "koa" {
    interface BaseContext {
        db: Db,
        models: ModelService,
    }
}

const main = async () => {
  const app = new Koa()
  const staticFiles = new Koa()
  staticFiles.use(serve('public'))

  const mongoUri = 
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/moba'
  
  const port = process.env.PORT || 3000

  console.log(`Connecting to the database [ ${mongoUri} ]`)
  app.context.db = await MongoClient.connect(mongoUri)
  app.context.models = new ModelService(app.context.db)
  console.log("Creating indexes..")
  await app.context.models.createIndexes()

  app.use(compress({threshold: 2048, flush: zlib.Z_SYNC_FLUSH}))
  app.use(errorHandler)
  app.use(bodyParser())
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(mount('/static', staticFiles))
  app.use(spaHandler)
  console.log(`Listening on port ${port}.`)
  app.listen(port)
}

main()
