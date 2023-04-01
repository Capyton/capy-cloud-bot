import { BotConfig } from './tgbot/config'
import { CapyCloudAPIConfig } from './infrastructure/capy-cloud/config'
import { DbConfig } from './infrastructure/db/config'

export class Config {
  constructor(
    public readonly bot: BotConfig,
    public readonly db: DbConfig,
    public readonly capyCloud: CapyCloudAPIConfig,
    public readonly defaultProvider: string,
  ) {}
}
