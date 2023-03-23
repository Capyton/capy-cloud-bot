import { UUID } from "@src/utils/uuid"

export class TgUser {
    constructor(
        readonly id: UUID,
        readonly tgId: number,
        readonly firstName: string,
        readonly lastName: string | null,
        readonly username: string | null,
    ) { }
}
