import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import {router} from './routes'
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
  app.context.db = await MongoClient.connect('mongodb://localhost:27017/moba')
  app.context.models = new ModelService(app.context.db)
  app.use(bodyParser())
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.listen(3000)
}

main()
