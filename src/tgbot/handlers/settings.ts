import { CommonContext } from '@src/tgbot/models/context'
import { address } from 'ton-core'

/**
 * Get settings
 */
export async function settings(ctx: CommonContext) {
  const callbackQuery = ctx.callbackQuery!
  const message = callbackQuery.message

  await ctx.reply(
    '🛠 Settings\n\n' +
    'Current provider address: ' +
    `<code>${address(ctx.tgUser!.providerAddress).toString()}</code>`,
    {
      parse_mode: 'HTML',
      message_thread_id: message?.message_thread_id,
    },
  )
}

/**
 * Get settings for unknown user
 */
export async function settingsFromUnknownUser(ctx: CommonContext) {
  await ctx.answerCallbackQuery(
    'You\'re not logged in. Please, login to your wallet to get and change settings.',
  )
}
