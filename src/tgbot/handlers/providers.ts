import { address, fromNano } from 'ton-core'

import { CommonContext } from '@src/tgbot/models/context'
import { InlineKeyboard } from 'grammy'
import { convertBytesToString } from '@src/utils/bytes'

/**
 * Get providers list by CapyCloud API
 */
export async function getProviders(ctx: CommonContext) {
  const message = ctx.message!
  const providers = await ctx.capyCloudAPI.getProviders()

  if (!providers.length) {
    await ctx.reply(
      'No providers found. Try again later.',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
    return
  }

  const providersList = providers.map((provider) => {
    return `<code>${address(provider.address).toString()}</code>`
  }).join('\n')

  await ctx.reply(
    `Providers:\n\n${providersList}\n\n` +
    'Type provider address to get provider params',
    {
      parse_mode: 'HTML',
      allow_sending_without_reply: true,
      message_thread_id: message.message_thread_id,
      reply_to_message_id: message.message_id,
    }
  )
}

/**
 * Get provider params by address and markup to set provider as current
 */
export async function getProviderParams(ctx: CommonContext) {
  const message = ctx.message!
  const providerAddress = message.text!

  try {
    const providerParams = await ctx.capyCloudAPI.getProviderParams(providerAddress)

    await ctx.reply(
      `Provider: <code>${address(providerAddress).toString()}</code>\n\n` +
      `Max file size: ${convertBytesToString(providerParams.maxFileSize)}\n` +
      `Min file size: ${convertBytesToString(providerParams.minFileSize)}\n` +
      `Accept new files: ${providerParams.acceptNewContracts}\n` +
      `Rate mb/day: ${fromNano(providerParams.ratePerMbDay)} TON`,
      {
        parse_mode: 'HTML',
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
        reply_markup: new InlineKeyboard().text('Set as current', `set-provider:${providerAddress}`),
      }
    )
  } catch (err) {
    console.log(`Error while getting provider params: ${err}`)

    await ctx.reply(
      'Can\'t get provider params. Try again later.',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
  }
}

/**
 * Get provider params by address for unknown user
 */
export async function getProviderParamsForUnknownUser(ctx: CommonContext) {
  const message = ctx.message!
  const providerAddress = message.text!

  try {
    const providerParams = await ctx.capyCloudAPI.getProviderParams(providerAddress)

    await ctx.reply(
      `Provider: <code>${address(providerAddress).toString()}</code>\n\n` +
      `Max file size: ${convertBytesToString(providerParams.maxFileSize)}\n` +
      `Min file size: ${convertBytesToString(providerParams.minFileSize)}\n` +
      `Accept new files: ${providerParams.acceptNewContracts}\n` +
      `Rate mb/day: ${fromNano(providerParams.ratePerMbDay)} TON`,
      {
        parse_mode: 'HTML',
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
  } catch (err) {
    console.log(`Error while getting provider params: ${err}`)

    await ctx.reply(
      'Can\'t get provider params. Try again later.',
      {
        allow_sending_without_reply: true,
        message_thread_id: message.message_thread_id,
        reply_to_message_id: message.message_id,
      }
    )
  }
}

/**
 * Set provider as current
 */
export async function setProviderCallback(ctx: CommonContext) {
  const callback = ctx.callbackQuery!
  const tgUser = ctx.tgUser!
  const providerAddress = callback.data!.split(':')[1]

  try {
    await ctx.capyCloudAPI.getProviderParams(providerAddress)

    // Set provider address as current for user to dabatase
    tgUser.providerAddress = providerAddress
    await ctx.tgUserRepo.updateTgUser(tgUser)
    await ctx.uow.commit()

    await ctx.answerCallbackQuery('Provider set as current')
  } catch (err) {
    await ctx.answerCallbackQuery('Can\'t set provider as current. Try again later.')
    return
  }
}
