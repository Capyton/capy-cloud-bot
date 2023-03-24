import CapyCloudAPI from '@src/services/capy-cloud/client'

import { Context as BaseContext } from 'grammy'
import { type ConversationFlavor } from '@grammyjs/conversations'
import { TypeORMUnitOfWork } from '@src/services/db/uow'
import { TgUserRepoImpl } from '@src/services/db/repositories/tg-user'
import { TgUser } from '@src/entities/tg-user'
import { DataSource } from 'typeorm'

class Context extends BaseContext {
  CapyCloudAPI: CapyCloudAPI
  dataSource: DataSource
  uow: TypeORMUnitOfWork
  tgUserRepo: TgUserRepoImpl

  tgUser: TgUser | null
}
type MyContext = Context & ConversationFlavor
export default MyContext
