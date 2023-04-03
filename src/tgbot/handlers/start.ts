import { CommonContext } from '@src/tgbot/models/context'
import { InlineKeyboard } from 'grammy'
import { TgUser } from '@src/entities/tg-user'
import { login } from './ton-connect'
import { uuid7 } from '@src/utils/uuid'

export async function start(ctx: CommonContext) {
  const message = ctx.message!
  const user = ctx.from!
  const lastName = user.last_name
  const fullName = lastName ? `${user.first_name} ${lastName}` : user.first_name

  await ctx.reply(
    `Hi, ${fullName}!\n\n` +
    'I\'m CapyCloud bot, a decentralized and convenient solution for communication with the Ton Storage.\n\n' +
    'If you have any questions, feel free to write @coalus\n\n' +
    'Good use!',
    {
      disable_web_page_preview: true,
      message_thread_id: message.message_thread_id,
      reply_markup: new InlineKeyboard()
        .text('🛠 Settings', 'settings'),
    },
  )
}

export async function startForUnknownUser(ctx: CommonContext) {
  const message = ctx.message!
  const user = ctx.from!
  const lastName = user.last_name
  const fullName = lastName ? `${user.first_name} ${lastName}` : user.first_name

  // Referral string from the link, for example: https://t.me/capycloud_bot?start=1234567, where 1234567 is referral
  const referral = ctx.match

  const tgUser = new TgUser(
    uuid7(),
    user.id,
    user.first_name,
    user.last_name || null,
    user.username || null,
    null,
  )
  ctx.tgUser = tgUser

  await ctx.tgUserRepo.addTgUser(tgUser)
  await ctx.uow.commit()

  await ctx.reply(
    `Hi, ${fullName}!\n\n` +
    'I\'m CapyCloud bot, a decentralized and convenient solution for communication with the Ton Storage.\n\n' +
    'If you have any questions, feel free to write @coalus\n\n' +
    'Good use!',
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

  // Start login user via wallet by TonConnect 2.0 protocol
  await login(ctx)
}

export async function startForUnloggedUser(ctx: CommonContext) {
  const message = ctx.message!
  const user = ctx.from!
  const lastName = user.last_name
  const fullName = lastName ? `${user.first_name} ${lastName}` : user.first_name

  await ctx.reply(
    `Hi, ${fullName}!\n\n` +
    'I\'m CapyCloud bot, a decentralized and convenient solution for communication with the Ton Storage.\n\n' +
    'If you have any questions, feel free to write @coalus\n\n' +
    'Good use!',
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

  // Start login user via wallet by TonConnect 2.0 protocol
  await login(ctx)
}
