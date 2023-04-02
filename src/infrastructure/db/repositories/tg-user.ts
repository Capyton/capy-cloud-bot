import { QueryRunner } from 'typeorm'
import { TgUser } from '@src/entities/tg-user'
import { TgUser as TgUserModel } from '@src/infrastructure/db/models'

export class TgUserRepoImpl {
  constructor(private readonly queryRunner: QueryRunner) {}

  getTgUserByTgId(tgId: number): Promise<TgUser> {
    return this.queryRunner.manager.findOne(TgUserModel, {
      where: { tgId: tgId },
    }).then((tgUser) => {
      if (!tgUser) {
        throw new Error(`Tguser with this ${tgId} tgId not found`)
      }
      return tgUser
    })
  }

  addTgUser(user: TgUser): Promise<void> {
    return this.queryRunner.manager.insert(TgUserModel, user).then(() => {})
  }

  updateTgUser(user: TgUser): Promise<void> {
    return this.queryRunner.manager.update(TgUserModel, user.id, user).then(() => {})
  }
}
