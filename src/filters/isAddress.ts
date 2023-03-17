import { Chat } from '@grammyjs/types'
import Context from '@/models/Context'

import { Address } from 'ton-core'

export const isAddress = (ctx: Context) => {
  return Address.isAddress(ctx.message?.text)
}
