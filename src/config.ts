import { CapyCloudAPIConfig } from "./services/capy-cloud/config";
import { DbConfig } from "./services/db/config";
import { BotConfig } from "./tgbot/config";


export class Config {
  constructor(
    public readonly bot: BotConfig,
    public readonly db: DbConfig,
    public readonly capyCloudApi: CapyCloudAPIConfig
  ) { }
}
