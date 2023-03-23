import { InlineKeyboard, InputFile } from 'grammy'

import MyContext from '@/models/Context'
import MyConversation from '@/models/Conversation'

import { TonConnectProvider } from '../services/providers/TonConnectProvider'
import { FSStorage } from '../services/storage/FSStorage'
import { generateQRCode } from '../utils/qr'
import { convertBytes } from './providers'

export async function handleDocument(
  conversations: MyConversation,
  ctx: MyContext
) {
  const fileSize = ctx.message?.photo ? ctx.message.photo.at(-1)?.file_size  :  ctx.message?.document?.file_size

  await ctx.reply(
    `Get it! How many TON you ready to spend to store this file? (Note that ${10} TON is enough to store this file for 3 months)`
  )

  const amount = await conversations.form.number()

  await ctx.reply('Ok, now lets login into your wallet')

  const provider = new TonConnectProvider(
    // @ts-ignore
    new FSStorage('./tc/' + ctx.message?.from.id.toString())
  )

  const walletConnect = await provider.connectWallet()

  const menu = new InlineKeyboard().url(
    'Login via tonkeeper',
    walletConnect.url
  )

  await generateQRCode(walletConnect.url).then(async (data) => {
    await ctx.replyWithPhoto(new InputFile(data), {
      caption: 'Scan this QR code:',
      reply_markup: menu,
    })
  })

  walletConnect.checker
    .then(async () => {
      await ctx.reply('Login to your wallet: ' + provider.address())
    })
    .catch(async () => {
      await ctx.reply("Can't login to your wallet. Try to upload file again.")
      return;
    })
  

}
