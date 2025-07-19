import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507190828121752928093128 implements MigrationInterface {
    name = 'Migration202507190828121752928093128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_category_experience" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "categoryId" uuid NOT NULL,
                "totalExperience" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_fa43c7f1d8da7a3c6c5ff1116fb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_365c47ce23dd5728451a420525" ON "user_category_experience" ("userId", "categoryId")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."experience_transaction_type_enum" AS ENUM(
                'HABIT_COMPLETION',
                'STREAK_BONUS',
                'ADMIN_ADJUSTMENT'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "experience_transaction" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "categoryId" uuid NOT NULL,
                "habitTaskId" uuid,
                "type" "public"."experience_transaction_type_enum" NOT NULL,
                "experienceGained" integer NOT NULL,
                "streakCount" integer,
                "multiplier" numeric(5, 2),
                "description" text,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_910097387a1203b815b17b68107" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a3194d174626b77cdb8d6d91a8" ON "experience_transaction" ("categoryId", "createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5d298713db6f11b077d8deb081" ON "experience_transaction" ("userId", "createdAt")
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience"
            ADD CONSTRAINT "FK_74a747f37d7b2c8432137d98178" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience"
            ADD CONSTRAINT "FK_fb4a6fe6b3f0ac7e2230e3dd91a" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_487e5804508d604c5c79fe16c1c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_417e7bdae7694e49fc7b7b35bdc" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_6c0cc3ffdfa1a3dc83486041c7a" FOREIGN KEY ("habitTaskId") REFERENCES "habit_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_6c0cc3ffdfa1a3dc83486041c7a"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_417e7bdae7694e49fc7b7b35bdc"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_487e5804508d604c5c79fe16c1c"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience" DROP CONSTRAINT "FK_fb4a6fe6b3f0ac7e2230e3dd91a"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience" DROP CONSTRAINT "FK_74a747f37d7b2c8432137d98178"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5d298713db6f11b077d8deb081"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a3194d174626b77cdb8d6d91a8"
        `);
        await queryRunner.query(`
            DROP TABLE "experience_transaction"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."experience_transaction_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_365c47ce23dd5728451a420525"
        `);
        await queryRunner.query(`
            DROP TABLE "user_category_experience"
        `);
    }

}
