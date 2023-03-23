import Context from '@src/models/Context'

export function unknownUser(ctx: Context) {
  return ctx.tgUser === null
}
