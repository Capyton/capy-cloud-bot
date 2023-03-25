import 'source-map-support'
import * as dotenv from 'dotenv'

import { run } from '@grammyjs/runner'
import { sequentialize } from 'grammy-middlewares'
import { conversations, createConversation } from '@grammyjs/conversations'
import { Bot, session } from 'grammy'

import MyContext from './tgbot/models/Context'
import { handleUnknownUser } from './tgbot/handlers/start'
import {
  CapyCloudAPIMiddleware,
  DbMiddleware,
  loggingMiddleware,
  loadTgUserMiddleware,
} from './tgbot/middlewares/'
import { handleDocument } from './tgbot/handlers/upload'
import { isAddress } from './tgbot/filters/is-address'
import { handleProvider } from './tgbot/handlers/providers'
import { getDataSource } from './infrastructure/db/main'
import { loadConfigFromEnv } from './infrastructure/config-loader'
import { unknownUser } from './tgbot/filters/unknown-user'
import { unloggedUser } from './tgbot/filters/unlogged-user'
import {
  handleTonConnectionLogin,
  handleTonConnectionLogout,
} from './tgbot/handlers/ton-connect'
import { initCapyCloudClient } from './infrastructure/capy-cloud/main'

dotenv.config()

async function runApp() {
  console.log('Starting app...')

  const config = loadConfigFromEnv()

  const dataSource = getDataSource(config.db)
  await dataSource
    .initialize()
    .then(() => console.log('Database initialized'))
    .catch((err) => {
      throw new Error(`Database initialization failed with error: \`${err}\``)
    })

  const capyCloudClient = initCapyCloudClient(config.capyCloud)

  const bot = new Bot<MyContext>(config.bot.token)

  // Middlewares
  const dbMiddleware = new DbMiddleware(dataSource)
  const capyCloudAPIMiddleware = new CapyCloudAPIMiddleware(capyCloudClient)
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
    .use(capyCloudAPIMiddleware.handle.bind(capyCloudAPIMiddleware))

  // Commands
  bot.on('message').filter(unknownUser, handleUnknownUser)
  bot.command(['start']).filter(unloggedUser, handleTonConnectionLogin)
  bot.command(['login'], handleTonConnectionLogin)
  bot.command(['logout'], handleTonConnectionLogout)

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
