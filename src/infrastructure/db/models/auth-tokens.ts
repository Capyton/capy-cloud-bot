import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'

import { TgUser } from './tg-user'
import { UUID } from '@src/utils/uuid'

@Entity({ name: 'auth_tokens' })
export class AuthTokens {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id: UUID

  @Column({ name: 'access_token', unique: false, nullable: false })
  accessToken: string

  @Column({ name: 'refresh_token', unique: false, nullable: false })
  refreshToken: string

  @ManyToOne(() => TgUser, (tgUser) => tgUser.refreshTokens)
  @JoinColumn({ name: 'tg_user_id' })
  tgUser: TgUser

  @Column({ type: 'uuid', name: 'tg_user_id' })
  tgUserId: UUID
}
