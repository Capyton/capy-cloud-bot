import { CommonContext } from '@src/tgbot/models/context'
import { InlineKeyboard } from 'grammy'
import { login } from './ton-connect'

export async function start(ctx: CommonContext) {
  const message = ctx.message!
  const user = ctx.from!
  const lastName = user.last_name
  const fullName = user.first_name + (lastName ? ' ' + lastName : '')

  const markup = new InlineKeyboard().text('🛠 Settings', 'settings')

  await ctx.reply(
    `Hi, ${fullName}!\n\n` +
    "I'm CapyCloud bot, a decentralized and convenient solution for communication with the Ton Storage.\n\n" +
    "If you have any questions, feel free to write @coalus\n\n" +
    "Good use!",
    {
      disable_web_page_preview: true,
      message_thread_id: message.message_thread_id,
      reply_markup: markup,
    },
  )
}

export async function startForUnloggedUser(ctx: CommonContext) {
  const message = ctx.message!
  const user = ctx.from!
  const lastName = user.last_name
  const fullName = user.first_name + (lastName ? ' ' + lastName : '')

  await ctx.reply(
    `Hi, ${fullName}!\n\n` +
    "I'm CapyCloud bot, a decentralized and convenient solution for communication with the Ton Storage.\n\n" +
    "If you have any questions, feel free to write @coalus\n\n" +
    "Good use!",
    {
      disable_web_page_preview: true,
      message_thread_id: message.message_thread_id,
    }
  )

  await ctx.reply(
    'Lets login into your wallet',
    {
    message_thread_id: message.message_thread_id,
    }
  )
  await login(ctx)
}
