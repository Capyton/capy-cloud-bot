import Context from '@src/models/Context'

import { Address } from 'ton-core'

export function isAddress(ctx: Context) {
  return Address.isAddress(ctx.message?.text)
}
