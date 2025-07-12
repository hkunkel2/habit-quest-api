import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507091454101752087250942 implements MigrationInterface {
  name = 'Migration202507091454101752087250942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "username" character varying(50)
    `);
  
    await queryRunner.query(`
      UPDATE "user"
      SET "username" = 'user_' || "id"
      WHERE "username" IS NULL
    `);
  
    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "username" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")
    `);
  
    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "email" TYPE character varying(255)
    `);
  
    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "password" TYPE character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "password"
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "password" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN "email" TYPE character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"
    `);
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "username"
    `);
  }
}