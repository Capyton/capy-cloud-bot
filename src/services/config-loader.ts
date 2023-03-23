import { BotConfig, Config } from "@src/config"
import { DbConfig } from "@src/services/db/config"
import { CapyCloudAPIConfig } from "./capy-cloud/config"

export function loadConfigFromEnv(): Config {

    if (!process.env.BOT_TOKEN) {
        throw new Error("Bot token not found")
    }
    const botConfig = new BotConfig(
        process.env.BOT_TOKEN
    )

    const databaseConfig = new DbConfig(
        process.env.POSTGRES_HOST,
        process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : undefined,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD,
        process.env.POSTGRES_DB,
    )

    const capyCloudApiConfig = new CapyCloudAPIConfig(
        process.env.API_HOST || "",
        process.env.API_PORT || "",
    )

    return new Config(botConfig, databaseConfig, capyCloudApiConfig)
}
