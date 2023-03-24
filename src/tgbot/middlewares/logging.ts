import { NextFunction } from 'grammy'
import MyContext from '@src/tgbot/models/Context'

export async function loggingMiddleware(ctx: MyContext, next: NextFunction) {
  console.log(`An update received: ${ctx.update.update_id}`)
  return await next()
    .then(() => {
      console.log(`An update handled: ${ctx.update.update_id}`)
    })
    .catch((err) => {
      console.error(
        `An error occured during handling this ${ctx.update.update_id} update: ${err}`
      )
    })
}
