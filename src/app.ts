import 'source-map-support'
import * as dotenv from 'dotenv'

import { run } from '@grammyjs/runner'
import { sequentialize } from 'grammy-middlewares'
import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot, session } from 'grammy'

import MyContext from './models/Context'
import { handleStart, handleUnknownUser } from './handlers/start'
import { attachCapyCloudAPI, DbMiddleware, loggingMiddleware } from './middlewares/'
import { handleDocument } from './handlers/upload'
import { isAddress } from './filters/is-address'
import { handleProvider } from './handlers/providers'
import { getDataSource } from './services/db/main'
import { loadConfigFromEnv } from './services/config-loader'
import { loadTgUserMiddleware } from './middlewares/tg-user-loader'
import { unknownUser } from './filters/unknown-user'

dotenv.config()

async function runApp() {
  console.log('Starting app...')

  const config = loadConfigFromEnv()

  const bot = new Bot<MyContext>(config.bot.token)

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

  const dataSource = getDataSource(config.db)
  await dataSource.initialize()
      .then(() => console.log("Database initialized"))
      .catch((err) => console.error(`Database initialization failed with error: \`${err}\``))

  const dbMiddleware = new DbMiddleware(dataSource)

  bot.use(sequentialize()).use(loggingMiddleware)
  bot.use(sequentialize()).use(dbMiddleware.handle.bind(dbMiddleware))
  bot.use(sequentialize()).use(loadTgUserMiddleware)
  bot.use(sequentialize()).use(attachCapyCloudAPI)

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
