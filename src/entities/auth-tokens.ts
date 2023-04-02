import { UUID } from '@src/utils/uuid'

export class AuthTokens {
    constructor(
        readonly id: UUID,
        readonly accessToken: string,
        readonly refreshToken: string,
        readonly tgUserId: UUID,
    ) { }
}
