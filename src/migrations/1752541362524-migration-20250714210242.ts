import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507142102421752541362524 implements MigrationInterface {
    name = 'Migration202507142102421752541362524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_relationship_type_enum" AS ENUM('PENDING', 'FRIEND', 'BLOCKED')
        `);
        await queryRunner.query(`
            CREATE TABLE "user_relationship" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "targetUserId" uuid NOT NULL,
                "type" "public"."user_relationship_type_enum" NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_f9a155e4a4954db14a4b3690fb3" UNIQUE ("userId", "targetUserId"),
                CONSTRAINT "PK_9822b30599d58e4204e19b972a9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "habit" DROP COLUMN "createdDate"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "user_relationship"
            ADD CONSTRAINT "FK_5fff67866cc8d9577e066cf96d9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_relationship"
            ADD CONSTRAINT "FK_d516827060c469d9913034b9477" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_relationship" DROP CONSTRAINT "FK_d516827060c469d9913034b9477"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_relationship" DROP CONSTRAINT "FK_5fff67866cc8d9577e066cf96d9"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit" DROP COLUMN "createdDate"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD "createdDate" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            DROP TABLE "user_relationship"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_relationship_type_enum"
        `);
    }

}
