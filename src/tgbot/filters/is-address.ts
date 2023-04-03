import { Address } from 'ton-core'
import { CommonContext } from '@src/tgbot/models/context'

/**
 * Check if message is address
 */
export function isAddress(ctx: CommonContext) {
  const address = ctx.message?.text
  if (!address) return false

  try {
    Address.parse(address)

    return true
  } catch (err) {
    console.log(`Error while parsing address: ${err}`)

    return false
  }
}

/**
 * Check if callback data after split by ':' is address
 */
export function isAddressCallback(ctx: CommonContext) {
  const address = ctx.callbackQuery?.data?.split(':').at(1)
  if (!address) return false

  try {
    Address.parse(address)

    return true
  } catch (err) {
    console.log(`Error while parsing address: ${err}`)

    return false
  }
}
