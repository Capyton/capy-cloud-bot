import 'source-map-support'
import * as dotenv from 'dotenv'

import { run } from '@grammyjs/runner'
import { sequentialize } from 'grammy-middlewares'
import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot, session } from 'grammy'

import MyContext from './models/Context'
import { handleStart } from './handlers/start'
import attachCapyCloudApi from './middlewares /CapyCloudMiddleware'
import { handleDocument } from './handlers/upload'
import { isAddress } from './filters/isAddress'
import { handleProvider } from './handlers/providers'

dotenv.config()

async function runApp() {
  console.log('Starting app...')

  if (!process.env.BOT_TOKEN) {
    console.log('Bot token not found')
    return
  }

  const bot = new Bot<MyContext>(process.env.BOT_TOKEN)

  // Middlewares

  bot.use(
    session({
      initial() {
        return {}
      },
    })
  )

  bot.use(conversations())
  bot.use(createConversation(handleDocument))

  bot.use(sequentialize()).use(attachCapyCloudApi)

  // Commands
  bot.command(['start'], handleStart)

  // @ts-ignore
  bot.on([':document', ':photo'], async (ctx) => {
    await ctx.conversation.enter('handleDocument')
  })

  bot.on(':text', handleProvider).filter(isAddress)

  // Errors
  bot.catch(console.error)

  // Start bot
  await bot.init()

  run(bot)

  console.info(`Bot @${bot.botInfo.username} is up and running`)
}

void runApp()
