import { InlineKeyboard, InputFile } from 'grammy'

import MyContext from '@src/tgbot/models/Context'

import { TonConnectProvider } from '@src/services/providers/TonConnectProvider'
import { FSStorage } from '@src/services/storage/FSStorage'
import { generateQRCode } from '@src/utils/qr'
import { TgUserRepoImpl } from '@src/services/db/repositories/tg-user'
import { TypeORMUnitOfWork } from '@src/services/db/uow'

const STORAGE_PATH = './tc/'

export async function handleTonConnectionLogin(ctx: MyContext) {
  if (!ctx.tgUser) {
    return
  }
  const tgUser = ctx.tgUser

  const provider = new TonConnectProvider(
    // @ts-ignore
    new FSStorage(STORAGE_PATH + ctx.message?.from.id.toString())
  )
  const walletConnect = await provider.connectWallet()
    .catch(async (err) => {
      const tonAddress = provider.address()
      if (!tonAddress) {
        throw err
      }
      tgUser.tonAddress = tonAddress.toString()
      await ctx.tgUserRepo.updateTgUser(tgUser)
      await ctx.uow.commit()

      await ctx.reply('Login to your wallet: ' + tgUser.tonAddress)
      await ctx.reply(
        'Now you can upload your files, or send a ready-made bagID our bot will do the rest of the work.'
      )
    })
  if (!walletConnect) {
    return
  }

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
      const tonAddress = provider.address()
      console.log(ctx)
      if (!tonAddress) {
        await _retryLogin(ctx)
        return
      }

      tgUser.tonAddress = tonAddress.toString()
      const queryRunner = ctx.dataSource.createQueryRunner()

      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        const uow = new TypeORMUnitOfWork(queryRunner)
        const tgUserRepo = new TgUserRepoImpl(queryRunner)
  
        await tgUserRepo.updateTgUser(tgUser)
        await uow.commit()
  
        // TODO: add User creation via the capy cloud api client
        await ctx.reply('Login to your wallet: ' + tgUser.tonAddress)
        await ctx.reply(
          'Now you can upload your files, or send a ready-made bagID our bot will do the rest of the work.'
        )
      } finally {
        await queryRunner.release()
      }
    })
    .catch(_retryLogin)
}

async function _retryLogin(ctx: MyContext) {
  console.log(ctx)
  await ctx.reply("Can't login to your wallet. Try to login again")
  handleTonConnectionLogin(ctx)
}

export async function handleTonConnectionLogout(ctx: MyContext) {
  if (!ctx.tgUser) {
    return
  }
  const tgUser = ctx.tgUser

  tgUser.tonAddress = null
  await ctx.tgUserRepo.updateTgUser(tgUser)
  await ctx.uow.commit()

  await ctx.reply('Logout from your wallet')
}
