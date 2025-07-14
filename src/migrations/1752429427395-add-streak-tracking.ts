import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStreakTracking1752429427395 implements MigrationInterface {
    name = 'AddStreakTracking1752429427395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "habit_task" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "taskDate" date NOT NULL,
                "isCompleted" boolean NOT NULL DEFAULT false,
                "completedAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid,
                "habitId" uuid,
                "streakId" uuid,
                CONSTRAINT "PK_862926589d4b915c9202624dcfe" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "streak" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "startDate" date NOT NULL,
                "endDate" date,
                "count" integer NOT NULL DEFAULT '0',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid,
                "habitId" uuid,
                CONSTRAINT "PK_dfb968d5a82b523a532bbf7cf70" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_c9dff67fdc38e5843a8cfb376ec" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_83e440392ef89718026b296c75e" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_20e92181a2144551cf5fbbc8400" FOREIGN KEY ("streakId") REFERENCES "streak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "streak"
            ADD CONSTRAINT "FK_34550648721dee4ee200c9b0b8c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "streak"
            ADD CONSTRAINT "FK_6c87c9248a8db841d17faf9764b" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "streak" DROP CONSTRAINT "FK_6c87c9248a8db841d17faf9764b"
        `);
        await queryRunner.query(`
            ALTER TABLE "streak" DROP CONSTRAINT "FK_34550648721dee4ee200c9b0b8c"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task" DROP CONSTRAINT "FK_20e92181a2144551cf5fbbc8400"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task" DROP CONSTRAINT "FK_83e440392ef89718026b296c75e"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task" DROP CONSTRAINT "FK_c9dff67fdc38e5843a8cfb376ec"
        `);
        await queryRunner.query(`
            DROP TABLE "streak"
        `);
        await queryRunner.query(`
            DROP TABLE "habit_task"
        `);
    }

}
