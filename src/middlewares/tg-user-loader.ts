import { NextFunction } from 'grammy'
import MyContext from '@src/models/Context'

export async function loadTgUserMiddleware(ctx: MyContext, next: NextFunction) {
  if (ctx.from !== undefined) {
    ctx.tgUser = await ctx.tgUserRepo.getTgUserByTgId(ctx.from.id).catch(() => null)
  } else {
    ctx.tgUser = null
  }
  return await next()
}
