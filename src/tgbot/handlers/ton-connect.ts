import { InlineKeyboard, InputFile } from 'grammy'

import { AuthTokens } from '@src/entities/auth-tokens'
import { AuthTokensRepoImpl } from '@src/infrastructure/db/repositories/auth-tokens'
import { CommonContext } from '@src/tgbot/models/context'
import { FSStorage } from '@src/infrastructure/storage/FSStorage'
import { TonConnectProvider } from '@src/infrastructure/providers/TonConnectProvider'
import { generateQRCode } from '@src/utils/qr'
import { uuid7 } from '@src/utils/uuid'

const TON_CONNECT_SESSIONS_DIR = process.env.TON_CONNECT_SESSIONS_DIR || './tc/'

export async function login(ctx: CommonContext) {
  const message = ctx.message!
  const tgUser = ctx.tgUser

  if (!tgUser) {
    console.error(
      '\`TgUser\` not found, but it should be. ' +
      `User: ${ JSON.stringify(message.from) }`
    )

    await ctx.reply(
      'You\'re not registered. ',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
    return
  }

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

      await ctx.reply(
        `Login to your wallet: ${tgUser.tonAddress}`,
        {
          allow_sending_without_reply: true,
          message_thread_id: message.message_thread_id,
          reply_to_message_id: message.message_id,
        }
      )
      await ctx.reply(
        'Now you can upload your files, ' +
        'or send a ready - made bagID our bot will do the rest of the work',
        {
          message_thread_id: message.message_thread_id,
        }
      )
    })
  if (!walletConnect) {
    return
  }

  await generateQRCode(walletConnect.url)
    .then(async (data) => {
        await ctx.replyWithPhoto(new InputFile
          (data), {
          caption: 'Scan this QR code:',
          message_thread_id: message.message_thread_id,
          reply_markup: new InlineKeyboard()
            .url('Login via tonkeeper', walletConnect.url),
        })
    })

  walletConnect.checker.then(async (wallet) => {
    const tonAddress = provider.address()

    if (!tonAddress) {
      console.error(`Address is not found in wallet: ${JSON.stringify(wallet)}`)

      await ctx.reply(
        'Can\'t login to your wallet. Try to login again',
        {
          allow_sending_without_reply: true,
          message_thread_id: message.message_thread_id,
          reply_to_message_id: message.message_id,
        }
      )
      return
    }

    tgUser.tonAddress = tonAddress.toString()
    await ctx.tgUserRepo.updateTgUser(tgUser)

    const apiAuthTokens = await ctx.capyCloudAPI.verifyPayload(wallet)
    const authTokensRepo = new AuthTokensRepoImpl(ctx.queryRunner)
    const authTokens = new AuthTokens(
      uuid7(),
      apiAuthTokens.accessToken,
      apiAuthTokens.refreshToken,
      tgUser.id
    )

    await authTokensRepo.removeAuthTokensByTgUser(authTokens.tgUserId)
    await authTokensRepo.addAuthTokens(authTokens)
    await ctx.uow.commit()

    await ctx.reply(
      `Login to your wallet: ${tgUser.tonAddress}`,
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
    await ctx.reply(
      'Now you can upload your files, ' +
      'or send a ready - made bagID our bot will do the rest of the work',
      {
        message_thread_id: message.message_thread_id,
      }
    )
  }).catch(async (err) => {
    console.log(`Error while login to ton wallet: ${err}`)

    await ctx.reply(
      'Can\'t login to your wallet. Try to login again',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
  })
}

export async function logout(ctx: CommonContext) {
  const message = ctx.message!
  const tgUser = ctx.tgUser

  if (!tgUser) {
    console.error(
      '\`TgUser\` not found, but it should be. ' +
      `User: ${JSON.stringify(message.from)}`
    )

    await ctx.reply(
      'You\'re not logged in',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
    return
  }

  tgUser.tonAddress = null
  await ctx.tgUserRepo.updateTgUser(tgUser)
  await ctx.uow.commit()

  await ctx.reply(
    'Logout from your wallet',
    {
      allow_sending_without_reply: true,
      message_thread_id: message.message_thread_id,
      reply_to_message_id: message.message_id,
    }
  )
}
