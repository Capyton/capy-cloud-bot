import { CapyCloudAPIConfig } from './infrastructure/capy-cloud/config'
import { DbConfig } from './infrastructure/db/config'
import { BotConfig } from './tgbot/config'

export class Config {
  constructor(
    public readonly bot: BotConfig,
    public readonly db: DbConfig,
    public readonly capyCloudApi: CapyCloudAPIConfig
  ) {}
}
