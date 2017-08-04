import * as Router from "koa-router"

export const router = new Router()

interface IUser {
  name: string
}

router.get('/', async (ctx) => {
  const users = ctx.db.collection('users')
  const user: IUser = await users.findOne({})
  ctx.body = `Hello World! ${user.name}`
})
