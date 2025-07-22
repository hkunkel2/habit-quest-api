import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507212351351753156295782 implements MigrationInterface {
    name = 'Migration202507212351351753156295782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_theme_enum" AS ENUM('LIGHT', 'DARK')
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "theme" "public"."user_theme_enum" NOT NULL DEFAULT 'LIGHT'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "theme"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_theme_enum"
        `);
    }

}
