import { address, fromNano } from 'ton-core'

import { CommonContext } from '@src/tgbot/models/context'
import { convertBytesToString } from '@src/utils/bytes'

export async function getProviderInfo(ctx: CommonContext) {
  const message = ctx.message!
  const providerAddress = message.text!
  const providerInfo = await ctx.capyCloudAPI.getProviderParams(providerAddress)

  if (!providerInfo) {
    await ctx.reply(
      'Can\'t get provider info. Check address you sent.',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
    return
  }

  await ctx.reply(
    `Provider: <code>${address(providerAddress).toString()}</code>\n\n` +
    `Max file size: ${convertBytesToString(providerInfo.maxFileSize)}\n` +
    `Min file size: ${convertBytesToString(providerInfo.minFileSize)}\n` +
    `Accept new files: ${providerInfo.acceptNewContracts}\n` +
    `Rate mb/day: ${fromNano(providerInfo.ratePerMbDay)} TON`,
    {
      parse_mode: 'HTML',
      allow_sending_without_reply: true,
      message_thread_id: message.message_thread_id,
      reply_to_message_id: message.message_id,
    },
  )
}
