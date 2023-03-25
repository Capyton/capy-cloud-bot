import { InlineKeyboard, InputFile } from 'grammy'

import MyContext from '@src/tgbot/models/Context'
import MyConversation from '@src/tgbot/models/Conversation'

import { TonConnectProvider } from '@src/infrastructure/providers/TonConnectProvider'
import { FSStorage } from '@src/infrastructure/storage/FSStorage'
import { generateQRCode } from '@src/utils/qr'
import { convertBytes } from './providers'

export async function handleDocument(
  conversations: MyConversation,
  ctx: MyContext
) {
  const fileSize = ctx.message?.photo
    ? ctx.message.photo.at(-1)?.file_size
    : ctx.message?.document?.file_size

  await ctx.reply(
    `Get it! How many TON you ready to spend to store this file? (Note that ${10} TON is enough to store this file for 3 months)`
  )

  const amount = await conversations.form.number()
}
