import {CommonContext} from '@src/tgbot/models/context'
import { NextFunction } from 'grammy'
import { TgUser } from '@src/entities/tg-user'
import { uuid7 } from '@src/utils/uuid'

export async function tgUserMiddleware(ctx: CommonContext, next: NextFunction) {
  const user = ctx.from

  if (user === undefined) {
    ctx.tgUser = null

    await next()
    return
  }

  const userId = user.id

  ctx.tgUser = await ctx.tgUserRepo
    .getTgUserByTgId(userId)
    .catch(async (err) => {
      console.log(`Failed to get user with id ${userId} from database: ${err}`)
      console.log(`Creating new user with id ${userId}`)

      await ctx.tgUserRepo.addTgUser(new TgUser(
        uuid7(),
        userId,
        user.first_name,
        user.last_name || null,
        user.username || null,
        null,
      ))
      await ctx.uow.commit()

      return await ctx.tgUserRepo.getTgUserByTgId(userId).catch((err) => {
        console.error(`Failed to get created user with id ${userId} from database: ${err}`)

        return null
      })
    })

  await next()
}
