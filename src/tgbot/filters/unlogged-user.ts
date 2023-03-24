import Context from '@src/tgbot/models/Context'

export function unloggedUser(ctx: Context) {
  return ctx.tgUser === null || ctx.tgUser.tonAddress === null
}
