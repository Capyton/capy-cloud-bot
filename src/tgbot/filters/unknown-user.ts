import { CommonContext } from '@src/tgbot/models/context'

export function unknownUser(ctx: CommonContext) {
  return ctx.tgUser === null
}

export function knownUser(ctx: CommonContext) {
  return !unknownUser(ctx)
}
