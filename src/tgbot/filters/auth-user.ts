import { CommonContext } from '@src/tgbot/models/context'

export function unloggedUser(ctx: CommonContext) {
  return ctx.tgUser === null || ctx.tgUser.tonAddress === null
}

export function loggedUser(ctx: CommonContext) {
  return !unloggedUser(ctx)
}
