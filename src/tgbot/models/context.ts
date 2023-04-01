import CapyCloudAPI from '@src/infrastructure/capy-cloud/client'
import { Context } from 'grammy'
import { ConversationFlavor } from '@grammyjs/conversations'
import { QueryRunner } from 'typeorm'
import { TgUser } from '@src/entities/tg-user'
import { TgUserRepoImpl } from '@src/infrastructure/db/repositories/tg-user'
import { TypeORMUnitOfWork } from '@src/infrastructure/db/uow'

export class RepoContext extends Context {
  tgUserRepo: TgUserRepoImpl
}

export class DbContext extends Context {
  uow: TypeORMUnitOfWork
  queryRunner: QueryRunner
}

export class CapyCloudContext extends Context {
  capyCloudAPI: CapyCloudAPI
}

export class TgContext extends Context {
  tgUser: TgUser | null
}

export type CommonContext = (
  RepoContext
  & DbContext
  & CapyCloudContext
  & TgContext
  & ConversationFlavor
)
