import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507121312081752340328307 implements MigrationInterface {
    name = 'Migration202507121312081752340328307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"),
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."habit_status_enum" AS ENUM(
                'Active',
                'Draft',
                'Completed',
                'Cancelled',
                'Deleted'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "habit" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
                "startDate" TIMESTAMP NOT NULL,
                "status" "public"."habit_status_enum" NOT NULL DEFAULT 'Draft',
                "userId" uuid,
                "categoryId" uuid,
                CONSTRAINT "PK_71654d5d0512043db43bac9abfc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "password"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD CONSTRAINT "FK_999000e9ce7a69128f471f0a3f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD CONSTRAINT "FK_cc3832692d337c59b1a8fb758b2" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Seed categories
        await queryRunner.query(`
            INSERT INTO "category" ("name", "active")
            VALUES 
                ('Fitness', true),
                ('Nutrition', true),
                ('Sleep', true),
                ('Mindfulness', true),
                ('Productivity', true),
                ('Reading', true),
                ('Religious', true),
                ('Social', true),
                ('Financial', true),
                ('Personal Development', true),
                ('Travel', true),
                ('Volunteering', true),
                ('Family', true),
                ('Career', true),
                ('Mental Health', true),
                ('Creativity', true),
                ('Learning', true),
                ('Self-Care', true),
                ('School', true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "habit" DROP CONSTRAINT "FK_cc3832692d337c59b1a8fb758b2"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit" DROP CONSTRAINT "FK_999000e9ce7a69128f471f0a3f9"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "password" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            DROP TABLE "habit"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."habit_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "category"
        `);
    }

}
