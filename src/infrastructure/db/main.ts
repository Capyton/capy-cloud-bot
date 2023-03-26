import { DataSource } from "typeorm"
import { DbConfig } from "./config"
import { AuthTokens, TgUser } from "./models"

export function getDataSource(config: DbConfig): DataSource {
  const dataSource = new DataSource({
      type: "postgres",
      host: config.host,
      port: config.port,
      username: config.user,
      password: config.password,
      database: config.database,
      synchronize: true,
      logging: true,
      subscribers: [],
      migrations: [],
      entities: [AuthTokens, TgUser],
  })

  return dataSource
}
