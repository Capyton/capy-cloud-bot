import { UUID } from '@src/utils/uuid'

export class TgUser {
    constructor(
        readonly id: UUID,
        readonly tgId: number,
        readonly firstName: string,
        readonly lastName: string | null,
        readonly username: string | null,
        public tonAddress: string | null = null,
        public providerAddress: string = '0:519109C1925A91F18364AFDD1DF22E765DE419F6D71248E2930B684DBC525111',
    ) { }
}
