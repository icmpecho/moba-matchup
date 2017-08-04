import * as Koa from "koa"
import {router} from "./routes"
import {MongoClient, Db} from "mongodb"

declare module "koa" {
    interface BaseContext {
        db: Db
    }
}

const main = async () => {
  const app = new Koa()
  app.context.db = await MongoClient.connect('mongodb://localhost:27017/moba')
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.listen(3000)
}

main()
