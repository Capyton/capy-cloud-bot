import { Config } from '@src/config'
import { DbConfig } from '@src/infrastructure/db/config'
import { CapyCloudAPIConfig } from './capy-cloud/config'
import { BotConfig } from '@src/tgbot/config'

export function loadConfigFromEnv(): Config {
  if (!process.env.BOT_TOKEN) {
    throw new Error('Bot token not found')
  }
  const botConfig = new BotConfig(process.env.BOT_TOKEN)

  const databaseConfig = new DbConfig(
    process.env.POSTGRES_HOST,
    process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : undefined,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    process.env.POSTGRES_DB
  )

  const capyCloudApiConfig = new CapyCloudAPIConfig(
    process.env.CAPY_CLOUD_BACKEND_HOST || '',
    process.env.AUTH_TOKEN || ''
  )
  const providerAddress = process.env.defaultProvider!
  return new Config(botConfig, databaseConfig, capyCloudApiConfig, providerAddress)
}
