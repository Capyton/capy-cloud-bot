import 'source-map-support'
import * as dotenv from 'dotenv'

import { run } from '@grammyjs/runner'
import { sequentialize } from 'grammy-middlewares'
import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot, session } from 'grammy'

import MyContext from './tgbot/models/Context'
import { handleStart, handleUnknownUser } from './tgbot/handlers/start'
import {
  attachCapyCloudAPI,
  DbMiddleware,
  loggingMiddleware,
} from './tgbot/middlewares/'
import { handleDocument } from './tgbot/handlers/upload'
import { isAddress } from './tgbot/filters/is-address'
import { handleProvider } from './tgbot/handlers/providers'
import { getDataSource } from './services/db/main'
import { loadConfigFromEnv } from './services/config-loader'
import { loadTgUserMiddleware } from './tgbot/middlewares/tg-user-loader'
import { unknownUser } from './tgbot/filters/unknown-user'

dotenv.config()

async function runApp() {
  console.log('Starting app...')

  const config = loadConfigFromEnv()

  const dataSource = getDataSource(config.db)
  await dataSource
    .initialize()
    .then(() => console.log('Database initialized'))
    .catch((err) =>
      console.error(`Database initialization failed with error: \`${err}\``)
    )

  const bot = new Bot<MyContext>(config.bot.token)

  // Middlewares
  const dbMiddleware = new DbMiddleware(dataSource)

  bot
    .use(loggingMiddleware)
    .use(
      session({
        initial() {
          return {}
        },
      })
    )
    .use(conversations())
    .use(createConversation(handleDocument))
    .use(sequentialize())
    .use(dbMiddleware.handle.bind(dbMiddleware))
    .use(loadTgUserMiddleware)
    .use(attachCapyCloudAPI)

  // Commands
  bot.on('message').filter(unknownUser, handleUnknownUser)
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
