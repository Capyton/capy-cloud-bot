import { QueryRunner } from "typeorm"

export class TypeORMUnitOfWork {
    constructor(
        private readonly queryRunner: QueryRunner,
    ) { }

    async commit(): Promise<void> {
        await this.queryRunner.commitTransaction()
        await this.queryRunner.startTransaction()
    }

    async rollback(): Promise<void> {
        await this.queryRunner.rollbackTransaction()
    }
}
