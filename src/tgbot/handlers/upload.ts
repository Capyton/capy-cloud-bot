import { InlineKeyboard, InputFile, Keyboard } from 'grammy'

import {CommonContext} from '@src/tgbot/models/context'
import { FSStorage } from '@src/infrastructure/storage/FSStorage'
import MyConversation from '@src/tgbot/models/conversation'
import { TonConnectProvider } from '@src/infrastructure/providers/TonConnectProvider'
import { convertBytesToString } from '@src/utils/bytes'
import { generateQRCode } from '@src/utils/qr'

export async function media(
  conversations: MyConversation,
  ctx: CommonContext
) {
  const fileSize = ctx.message?.photo
    ? ctx.message.photo.at(-1)?.file_size
    : ctx.message?.document?.file_size

  await ctx.reply(
    'Get it! How many TON you ready to spend to store this file? ' +
    `(Note that ${10} TON is enough to store this file for 3 months)`,
  )

  const amount = await conversations.form.number()
}

export async function mediaFromUnloggedUser(ctx: CommonContext) {
  await ctx.reply(
    'You\'re not logged in. Please, login to your wallet to upload files.',
    {
      allow_sending_without_reply: true,
      message_thread_id: ctx.message?.message_thread_id,
      reply_to_message_id: ctx.message?.message_id,
    }
  )
}
