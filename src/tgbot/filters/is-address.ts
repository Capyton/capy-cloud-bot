import Context from '@src/tgbot/models/Context'

import { Address } from 'ton-core'

export function isAddress(ctx: Context) {
  return Address.isAddress(ctx.message?.text)
}
