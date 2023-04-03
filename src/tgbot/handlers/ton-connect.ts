import { InlineKeyboard, InputFile } from 'grammy'
import { WalletAlreadyConnectedError, WalletNotConnectedError } from '@tonconnect/sdk'

import { AuthTokens } from '@src/entities/auth-tokens'
import { CommonContext } from '@src/tgbot/models/context'
import { FSStorage } from '@src/infrastructure/storage/fs-storage'
import { TonConnectProvider } from '@src/infrastructure/providers/ton-connect-provider'
import { WalletController } from '@src/controllers/wallet'
import { generateQRCode } from '@src/utils/qr'
import { uuid7 } from '@src/utils/uuid'

const TON_CONNECT_SESSIONS_DIR = process.env.TON_CONNECT_SESSIONS_DIR || './tc/'

/**
 * Login to wallet
 */
export async function login(ctx: CommonContext) {
  const message = ctx.message!
  const tgUser = ctx.tgUser!
  const tgUserId = tgUser.id
  const userSessionPath = `${TON_CONNECT_SESSIONS_DIR}${tgUserId}`

  const provider = new TonConnectProvider(new FSStorage(userSessionPath))
  const walletController = new WalletController(provider)

  const payload = await ctx.capyCloudAPI.generatePayload().catch(async (err) => {
    console.error(`Error while generating payload: ${err}`)

    await ctx.reply(
      'Something went wrong. Please try again later.',
      {
        message_thread_id: message.message_thread_id,
      }
    )
  })
  if (!payload) return

  try {
    // Try to connect to wallet, if it's already connected, throw an error
    const walletConnect = await walletController.connect(payload)

    // Generate QR code to login to wallet
    const buffer = await generateQRCode(walletConnect.url)

    // Send QR code to user
    const qrCodeMessage = await ctx.replyWithPhoto(new InputFile(buffer), {
      caption: 'Scan this QR code:',
      message_thread_id: message.message_thread_id,
      reply_markup: new InlineKeyboard()
        .url('Login via tonkeeper', walletConnect.url),
    })

    await walletController
      .checkWalletAndAddress(walletConnect)
      .then(async ({ wallet, address }) => {
        console.log(
          `User ${tgUserId} connected to wallet: ${address}`
        )

        // Generate auth tokens for user and verify wallet proof
        const apiAuthTokens = await ctx.capyCloudAPI.verifyPayload(wallet)
        const authTokens = new AuthTokens(
          uuid7(),
          apiAuthTokens.accessToken,
          apiAuthTokens.refreshToken,
          tgUserId,
        )

        // Save user's address to database
        tgUser.tonAddress = address
        await ctx.tgUserRepo.updateTgUser(tgUser)

        // Remove old auth tokens from database, if they exist
        await ctx.authTokensRepo.removeAuthTokensByTgUser(tgUserId)
        // Save auth tokens to database
        await ctx.authTokensRepo.addAuthTokens(authTokens)

        await ctx.uow.commit()

        await ctx.reply(
          `You're connected to wallet: <code>${address}</code>`,
          {
            parse_mode: 'HTML',
            allow_sending_without_reply: true,
            message_thread_id: qrCodeMessage.message_thread_id,
            reply_to_message_id: qrCodeMessage.message_id,
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
      .catch(async (err) => {
        console.error(`Can't login to wallet for user ${tgUserId}: ${err}`)

        // Disconnect from wallet, because we no need save session with failed login
        await walletController.disconnect()

        await ctx.reply(
          'Can\'t login to your wallet. Try to login again',
          {
            allow_sending_without_reply: true,
            message_thread_id: qrCodeMessage.message_thread_id,
            reply_to_message_id: qrCodeMessage.message_id,
          }
        )
      })
  } catch (err) {
    if (err instanceof WalletAlreadyConnectedError) {
      const address = walletController.getAddress()

      await ctx.reply(
        `You're already connected to wallet: <code>${address}</code>.\n\n` +
        'If you want to connect to another wallet, ' +
        'please disconnect from the current one first.',
        {
          parse_mode: 'HTML',
          allow_sending_without_reply: true,
          message_thread_id: message.message_thread_id,
          reply_to_message_id: message.message_id,
        }
      )
      return
    } else {
      throw err
    }
  }
}

/**
 * Logout from wallet
 */
export async function logout(ctx: CommonContext) {
  const message = ctx.message!
  const tgUser = ctx.tgUser!
  const tonAddress = tgUser.tonAddress
  const tgUserId = tgUser.id
  const userSessionPath = `${TON_CONNECT_SESSIONS_DIR}${tgUserId}`

  const provider = new TonConnectProvider(new FSStorage(userSessionPath))
  const walletController = new WalletController(provider)

  try {
    // Disconnect from wallet and remove session, if it's connected
    await walletController.disconnect()
  } catch (err) {
    if (err instanceof WalletNotConnectedError) {
      if (!tonAddress) {
        await ctx.reply(
          'You\'re not connected to wallet',
          {
            allow_sending_without_reply: true,
            message_thread_id: message.message_thread_id,
            reply_to_message_id: message.message_id,
          }
        )
        return
      }

      console.error(
        `Can't disconnect from wallet for user ${tgUserId}: ${err}, ` +
        `but user have TON address: ${tonAddress}`,
      )
    } else {
      console.error(
        `Can't disconnect from wallet for user ${tgUserId}: ${err} (unknown error), ` +
        `but user have TON address: ${tonAddress}`,
      )
    }
  }

  // Remove session from file system
  walletController.removeSession().catch((err) => {
    console.error(
      `Can't remove session for user ${tgUserId}: ${err}`,
    )
  })

  // Remove user's address from database
  tgUser.tonAddress = null
  ctx.tgUser = tgUser
  await ctx.tgUserRepo.updateTgUser(tgUser)

  // Remove auth tokens from database
  await ctx.authTokensRepo.removeAuthTokensByTgUser(tgUserId)

  await ctx.uow.commit()

  if (tonAddress) {
    await ctx.reply(
      `You're disconnected from wallet: <code>${tonAddress}</code>`,
      {
        parse_mode: 'HTML',
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
    return
  }

  console.error(
    'User disconnected from wallet, ' +
    `but he hasn't address in database: ${tgUserId}`,
  )

  await ctx.reply(
    'You\'re disconnected from wallet',
    {
      allow_sending_without_reply: true,
      message_thread_id: message.message_thread_id,
      reply_to_message_id: message.message_id,
    }
  )
}
