import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507121403591752343439768 implements MigrationInterface {
    name = 'Migration202507121403591752343439768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "habit"
            ALTER COLUMN "startDate" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "habit"
            ALTER COLUMN "startDate"
            SET NOT NULL
        `);
    }

}
