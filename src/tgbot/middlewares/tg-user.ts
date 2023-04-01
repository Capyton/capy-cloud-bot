import {CommonContext} from '@src/tgbot/models/context'
import { NextFunction } from 'grammy'

export async function tgUserMiddleware(ctx: CommonContext, next: NextFunction) {
  const user = ctx.from

  if (user === undefined) {
    ctx.tgUser = null
  } else {
    ctx.tgUser = await ctx.tgUserRepo
      .getTgUserByTgId(user.id)
      .catch(() => null)
  }

  await next()
}
