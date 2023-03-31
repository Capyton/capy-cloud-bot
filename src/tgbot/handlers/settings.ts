import { CommonContext } from '@src/tgbot/models/context'
import { address } from 'ton-core'

export async function settings(ctx: CommonContext) {
  let callbackQuery = ctx.callbackQuery!
  let message = callbackQuery.message

  await ctx.reply(
    '🛠 Settings\n\n' +
    'Current provider address: ' +
    `<code>${address(ctx.tgUser!.providerAddress).toString()}</code>`,
    {
      parse_mode: 'HTML',
      message_thread_id: message?.message_thread_id,
    }
  )
}

export async function settingsFromUnloggedUser(ctx: CommonContext) {
  await ctx.answerCallbackQuery(
    'You\'re not logged in. Please, login to your wallet to get and change settings.',
  )
}
