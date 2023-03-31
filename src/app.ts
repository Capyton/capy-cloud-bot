import 'source-map-support'

import * as dotenv from 'dotenv'

import { Bot, session } from 'grammy'
import {
  CapyCloudAPIMiddleware,
  DbMiddleware,
  loggingMiddleware,
  tgUserMiddleware,
} from './tgbot/middlewares/'
import { conversations, createConversation } from '@grammyjs/conversations'
import { loggedUser, unloggedUser } from './tgbot/filters/auth-user'
import { login, logout } from './tgbot/handlers/ton-connect'
import { media, mediaFromUnloggedUser } from './tgbot/handlers/upload'
import { settings, settingsFromUnloggedUser } from './tgbot/handlers/settings'
import { start, startForUnloggedUser } from './tgbot/handlers/start'

import { CommonContext } from './tgbot/models/context'
import { getDataSource } from './infrastructure/db/main'
import { getProviderInfo } from './tgbot/handlers/providers'
import { initCapyCloudClient } from './infrastructure/capy-cloud/main'
import { isAddress } from './tgbot/filters/is-address'
import { loadConfigFromEnv } from './infrastructure/config-loader'
import { run } from '@grammyjs/runner'
import { sequentialize } from 'grammy-middlewares'

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

  const bot = new Bot<CommonContext>(config.bot.token)

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
    .use(createConversation(media, 'media'))
    .use(sequentialize())
    .use(dbMiddleware.handle.bind(dbMiddleware))
    .use(tgUserMiddleware)
    .use(capyCloudAPIMiddleware.handle.bind(capyCloudAPIMiddleware))

  // bot.on('message').filter(unknownUser, handleUnknownUser)

  // Start handlers
  bot.filter(loggedUser).command(['start'], start)
  bot.filter(unloggedUser).command(['start'], startForUnloggedUser)

  // Auth handlers
  bot.command(['login'], login)
  bot.command(['logout'], logout)

  // Settings handlers
  bot.filter(loggedUser).callbackQuery('settings', settings)
  bot.filter(unloggedUser).callbackQuery('settings', settingsFromUnloggedUser)

  // Handler for accept provider address and reply provider info
  bot.filter(isAddress).on(':text', getProviderInfo)

  bot.filter(loggedUser).on([
    ':photo', ':animation', ':audio',
    ':document', ':video', ':video_note',
    ':voice', ':sticker',
  ], async (ctx) => {
    await ctx.conversation.enter('media')
  })
  bot.filter(unloggedUser).on([
    ':photo', ':animation', ':audio',
    ':document', ':video', ':video_note',
    ':voice', ':sticker',
  ], mediaFromUnloggedUser)

  // Error handler
  bot.catch((err) => {
    console.error(`Error occured: ${err}`)
  })

  // Initialize bot
  await bot.init()

  // Run bot
  run(bot)

  console.info(`Bot @${bot.botInfo.username} is up and running`)
}

void runApp()
