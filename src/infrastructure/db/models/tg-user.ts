import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'

import { AuthTokens } from './auth-tokens'
import { UUID } from '@src/utils/uuid'

@Entity({ name: 'tg_users' })
export class TgUser {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id: UUID

  @Column({ type: 'bigint', name: 'tg_id', unique: true, nullable: false })
  tgId: number

  @Column({ name: 'first_name', nullable: false })
  firstName: string

  @Column({ type: String, name: 'last_name', nullable: true })
  lastName: string | null

  @Column({ type: String, name: 'username', nullable: true })
  username: string | null

  @Column({ type: String, name: 'ton_address', nullable: true })
  tonAddress: string | null

  @OneToMany(() => AuthTokens, (authTokens) => authTokens.tgUser, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  refreshTokens: AuthTokens[]

  @Column({ type: String, name: 'provider_address', nullable: false })
  providerAddress: string
}
