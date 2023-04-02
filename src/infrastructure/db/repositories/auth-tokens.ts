import { AuthTokens } from '@src/entities/auth-tokens'
import { AuthTokens as AuthTokensModel } from '@src/infrastructure/db/models'
import { QueryRunner } from 'typeorm'
import { UUID } from '@src/utils/uuid'

export class AuthTokensRepoImpl {
  constructor(private readonly queryRunner: QueryRunner) {}

  getAuthTokenByTgUserId(tgUserId: UUID): Promise<AuthTokens> {
    return this.queryRunner.manager.findOne(AuthTokensModel, {
      where: { tgUserId: tgUserId },
    }).then((authTokens) => {
      if (!authTokens) {
        throw new Error(`Auth tokens with this ${tgUserId} tgUserId not found`)
      }
      return authTokens
    })
  }

  addAuthTokens(authTokens: AuthTokens): Promise<void> {
    return this.queryRunner.manager.insert(AuthTokensModel, authTokens).then(() => {})
  }

  removeAuthTokensByTgUser(tgUserId: UUID): Promise<void> {
    return this.queryRunner.manager.delete(AuthTokensModel, {
      tgUserId: tgUserId,
    }).then(() => {})
  }
}
