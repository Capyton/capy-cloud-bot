import { QueryRunner } from 'typeorm'
import { AuthTokens } from '@src/entities/auth-tokens'
import { AuthTokens as AuthTokensModel } from '@src/infrastructure/db/models'
import { UUID } from '@src/utils/uuid'

export class AuthTokensRepoImpl {
  constructor(private readonly queryRunner: QueryRunner) {}

  async getAuthTokenByTgUserId(tgUserId: UUID): Promise<AuthTokens> {
    const authTokens = await this.queryRunner.manager.findOne(AuthTokensModel, {
      where: { tgUserId: tgUserId },
    })
    if (!authTokens) {
      throw new Error(`Auth tokens with this ${tgUserId} tgUserId not found`)
    }
    return authTokens
  }

  async addAuthTokens(authTokens: AuthTokens): Promise<void> {
    await this.queryRunner.manager.insert(AuthTokensModel, authTokens)
  }

  async removeAuthTokensByTgUser(tgUserId: UUID): Promise<void> {
    await this.queryRunner.manager.delete(AuthTokensModel, {
      tgUserId: tgUserId,
    })
  }
}
