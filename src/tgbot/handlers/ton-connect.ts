import { InlineKeyboard, InputFile } from 'grammy'

import MyContext from '@src/tgbot/models/Context'

import { TonConnectProvider } from '@src/infrastructure/providers/TonConnectProvider'
import { FSStorage } from '@src/infrastructure/storage/FSStorage'
import { generateQRCode } from '@src/utils/qr'
import { TgUserRepoImpl } from '@src/infrastructure/db/repositories/tg-user'
import { TypeORMUnitOfWork } from '@src/infrastructure/db/uow'
import { Wallet } from '@tonconnect/sdk'
import { AuthTokensRepoImpl } from '@src/infrastructure/db/repositories/auth-tokens'
import { AuthTokens } from '@src/entities/auth-tokens'
import { uuid7 } from '@src/utils/uuid'

const TON_CONNECT_SESSIONS_DIR = process.env.TON_CONNECT_SESSIONS_DIR || './tc/'

export async function handleTonConnectionLogin(ctx: MyContext) {
  if (!ctx.tgUser) {
    return
  }
  const tgUser = ctx.tgUser

  const provider = new TonConnectProvider(
    new FSStorage(TON_CONNECT_SESSIONS_DIR + tgUser.id.toString()),
  )

  const payload = await ctx.capyCloudAPI.generatePayload()
  const walletConnect = await provider
    .connectWallet(payload.nonce)
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
    .then(async (wallet: Wallet) => {
      const tonAddress = provider.address()
      if (!tonAddress) {
        await _retryLogin(ctx)
        return
      }
      const apiAuthTokens = await ctx.capyCloudAPI.verifyPayload(wallet)

      tgUser.tonAddress = tonAddress.toString()
      const queryRunner = ctx.dataSource.createQueryRunner()

      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        const uow = new TypeORMUnitOfWork(queryRunner)
        const tgUserRepo = new TgUserRepoImpl(queryRunner)
        const authTokensRepo = new AuthTokensRepoImpl(queryRunner)

        await tgUserRepo.updateTgUser(tgUser)
        
        const authTokens = new AuthTokens(uuid7(), apiAuthTokens.accessToken, apiAuthTokens.refreshToken, tgUser.id)
        await authTokensRepo.removeAuthTokensByTgUser(authTokens.tgUserId)
        await authTokensRepo.addAuthTokens(authTokens)
        await uow.commit()

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
