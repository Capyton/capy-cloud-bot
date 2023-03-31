import { CommonContext } from '@src/tgbot/models/context'
import { NextFunction } from 'grammy'

export async function loggingMiddleware(ctx: CommonContext, next: NextFunction) {
  console.log(`An update received: ${ctx.update.update_id}`)

  await next()
    .then(() => {
      console.log(`An update handled: ${ctx.update.update_id}`)
    })
    .catch((err) => {
      console.error(
        `An error occured during handling this ${ctx.update.update_id} update. Error: ${err}`,
      )
    })
}
