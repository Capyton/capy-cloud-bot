import * as dotenv from 'dotenv'

import { run } from '@grammyjs/runner'
import { Bot, Context } from 'grammy'

import { handleStart } from './handlers/start'

dotenv.config()

async function runApp() {
  console.log('Starting app...')

  if (!process.env.BOT_TOKEN) {
    console.log('Bot token not found')
    return
  }

  const bot = new Bot<Context>(process.env.BOT_TOKEN, {
    ContextConstructor: Context,
  })

  // Commands
  bot.command(['start'], handleStart)

  // New document
  // bot.on([':document', ':photo'], handleDocument)

  // Errors
  bot.catch(console.error)

  // Start bot
  await bot.init()

  run(bot)

  console.info(`Bot @${bot.botInfo.username} is up and running`)
}

void runApp()
