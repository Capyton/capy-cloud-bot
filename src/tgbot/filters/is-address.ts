import { Address } from 'ton-core'
import { CommonContext } from '@src/tgbot/models/context'

export function isAddress(ctx: CommonContext) {
  return Address.isAddress(ctx.message?.text)
}
