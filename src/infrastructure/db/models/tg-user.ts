/* eslint-disable indent */

import { Column, Entity, PrimaryColumn } from "typeorm"

import { UUID } from "@src/utils/uuid"

@Entity({ name: "tg_users" })
export class TgUser {
  @PrimaryColumn({ name: "id" })
  id: UUID

  @Column({ name: "tg_id", unique: true, nullable: false })
  tgId: number

  @Column({ name: "first_name", nullable: false })
  firstName: string

  @Column({ type: String, name: "last_name", nullable: true })
  lastName: string | null

  @Column({ type: String, name: "username", nullable: true })
  username: string | null

  @Column({ type: String, name: "ton_address", nullable: true })
  tonAddress: string | null
}
