import { CapyCloudAPIConfig } from "./services/capy-cloud/config";
import { DbConfig } from "./services/db/config";

export class BotConfig {
  constructor(
    public readonly token: string,
  ) {}
}

export class Config {
  constructor(
    public readonly bot: BotConfig,
    public readonly db: DbConfig,
    public readonly capyCloudApi: CapyCloudAPIConfig
  ) { }
}
