import { DataSource, QueryRunner } from 'typeorm'

import { CommonContext } from '@src/tgbot/models/context'
import { NextFunction } from 'grammy'
import { TgUserRepoImpl } from '@src/infrastructure/db/repositories/tg-user'
import { TypeORMUnitOfWork } from '@src/infrastructure/db/uow'

export class DbMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get a `QueryRunner` from the `DataSource` and start a transaction
   * @returns A `QueryRunner` that is connected to the database and has a transaction started
   */
  async getQueryRunner(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner()

    await queryRunner.connect()
    await queryRunner.startTransaction()

    return queryRunner
  }

  async handle(ctx: CommonContext, next: NextFunction) {
    const queryRunner = await this.getQueryRunner()

    ctx.queryRunner = queryRunner
    ctx.uow = new TypeORMUnitOfWork(queryRunner)

    // TODO: Move this to a separate middleware or something like that?
    ctx.tgUserRepo = new TgUserRepoImpl(queryRunner)

    await next().finally(() => {
      console.log('Release transaction')

      queryRunner
        .release()
        .catch((err) =>
          console.error(`Failed to release the QueryRunner: ${err}`)
        )
    })
  }
}
