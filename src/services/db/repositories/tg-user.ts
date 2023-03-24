import { QueryRunner } from 'typeorm'
import { UUID } from '@src/utils/uuid'
import { TgUser } from '@src/entities/tg-user'
import { TgUser as TgUserModel } from '@src/services/db/models'

export class TgUserRepoImpl {
  constructor(private readonly queryRunner: QueryRunner) {}

  async getTgUserByTgId(tgId: number): Promise<TgUser> {
    const tgUser = await this.queryRunner.manager.findOne(TgUserModel, {
      where: { tgId: tgId },
    })
    if (!tgUser) {
      throw new Error(`Tguser with this ${tgId} tgId not found`)
    }
    return tgUser
  }

  async addTgUser(user: TgUser): Promise<void> {
    await this.queryRunner.manager.insert(TgUserModel, user)
  }
}
