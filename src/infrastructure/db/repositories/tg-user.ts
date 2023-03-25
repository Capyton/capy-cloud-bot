import { QueryRunner } from 'typeorm'
import { TgUser } from '@src/entities/tg-user'
import { TgUser as TgUserModel } from '@src/infrastructure/db/models'

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

  async updateTgUser(user: TgUser): Promise<void> {
    await this.queryRunner.manager.update(TgUserModel, user.id, user)
  }
}
