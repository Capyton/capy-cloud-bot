import 'source-map-support'

import * as dotenv from 'dotenv'

import { Bot, session } from 'grammy'
import {
  CapyCloudAPIMiddleware,
  DbMiddleware,
  loggingMiddleware,
  tgUserMiddleware,
} from './tgbot/middlewares'
import { conversations, createConversation } from '@grammyjs/conversations'
import {
  getProviderParams,
  getProviderParamsForUnknownUser,
  getProviders,
  setProviderCallback,
} from './tgbot/handlers/providers'
import { isAddress, isAddressCallback } from './tgbot/filters/is-address'
import { knownUser, unknownUser } from './tgbot/filters/unknown-user'
import { loggedUser, unloggedUser } from './tgbot/filters/auth-user'
import { login, logout } from './tgbot/handlers/ton-connect'
import { media, mediaFromUnloggedUser } from './tgbot/handlers/upload'
import { settings, settingsFromUnknownUser } from './tgbot/handlers/settings'
import { start, startForUnknownUser, startForUnloggedUser } from './tgbot/handlers/start'

import { CommonContext } from './tgbot/models/context'
import { getDataSource } from './infrastructure/db/main'
import { help } from './tgbot/handlers/help'
// import { hydrateFiles } from '@grammyjs/files'
import { initCapyCloudClient } from './infrastructure/capy-cloud/main'
import { loadConfigFromEnv } from './infrastructure/config-loader'
import { run } from '@grammyjs/runner'

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

  // Configure bot
  // bot.api.config.use(hydrateFiles(bot.token))

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
    .use(dbMiddleware.handle.bind(dbMiddleware))
    .use(tgUserMiddleware)
    .use(capyCloudAPIMiddleware.handle.bind(capyCloudAPIMiddleware))

  await bot.api.setMyCommands([
    { command: 'start', description: 'Start bot' },
    { command: 'help', description: 'Show help' },
    { command: 'providers', description: 'Show providers' },
    { command: 'login', description: 'Login to wallet' },
    { command: 'logout', description: 'Logout from wallet' },
  ])

  // In some cases we don't need to use `knownUser` filter, because
  // logged users always are known users, so we can use `loggedUser` filter instead of `knownUser` and `loggedUser`

  // Start handlers
  bot.filter(unknownUser).command(['start'], startForUnknownUser)
  bot.filter(knownUser).filter(unloggedUser).command(['start'], startForUnloggedUser)
  bot.filter(loggedUser).command(['start'], start)

  // Help handlers
  bot.command(['help'], help)

  // Auth handlers
  bot.filter(knownUser).command(['login'], login)
  bot.filter(knownUser).command(['logout'], logout)

  // Settings handlers
  bot.filter(knownUser).callbackQuery('settings', settings)
  bot.filter(knownUser).callbackQuery('settings', settingsFromUnknownUser)

  // Providers handlers
  bot.command(['providers'], getProviders)
  bot.filter(unknownUser).filter(isAddress).on(':text', getProviderParamsForUnknownUser)
  bot.filter(knownUser).filter(isAddress).on(':text', getProviderParams)
  bot.filter(knownUser).filter(isAddressCallback).on('callback_query', setProviderCallback)

  // Upload media handlers
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
