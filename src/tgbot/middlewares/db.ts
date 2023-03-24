import { NextFunction } from 'grammy'
import MyContext from '@src/tgbot/models/Context'
import { DataSource, QueryRunner } from 'typeorm'
import { TgUserRepoImpl } from '@src/services/db/repositories/tg-user'
import { TypeORMUnitOfWork } from '@src/services/db/uow'

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

  async handle(ctx: MyContext, next: NextFunction) {
    const queryRunner = await this.getQueryRunner()

    ctx.dataSource = this.dataSource
    ctx.uow = new TypeORMUnitOfWork(queryRunner)
    ctx.tgUserRepo = new TgUserRepoImpl(queryRunner)

    return await next().finally(() => {
      console.log('Release transaction')
      queryRunner
        .release()
        .catch((err) =>
          console.error('Failed to release the QueryRunner: ', err)
        )
    })
  }
}
