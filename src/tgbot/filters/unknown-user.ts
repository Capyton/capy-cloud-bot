import Context from '@src/tgbot/models/Context'

export function unknownUser(ctx: Context) {
  return ctx.tgUser === null
}
