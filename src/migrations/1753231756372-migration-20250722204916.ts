import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202507222049161753231756372 implements MigrationInterface {
    name = 'Migration202507222049161753231756372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_category_experience" DROP CONSTRAINT "FK_74a747f37d7b2c8432137d98178"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience" DROP CONSTRAINT "FK_fb4a6fe6b3f0ac7e2230e3dd91a"
        `);
        await queryRunner.query(`
            ALTER TABLE "streak" DROP CONSTRAINT "FK_34550648721dee4ee200c9b0b8c"
        `);
        await queryRunner.query(`
            ALTER TABLE "streak" DROP CONSTRAINT "FK_6c87c9248a8db841d17faf9764b"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task" DROP CONSTRAINT "FK_c9dff67fdc38e5843a8cfb376ec"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task" DROP CONSTRAINT "FK_83e440392ef89718026b296c75e"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task" DROP CONSTRAINT "FK_20e92181a2144551cf5fbbc8400"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_487e5804508d604c5c79fe16c1c"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_417e7bdae7694e49fc7b7b35bdc"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_6c0cc3ffdfa1a3dc83486041c7a"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit" DROP CONSTRAINT "FK_999000e9ce7a69128f471f0a3f9"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit" DROP CONSTRAINT "FK_cc3832692d337c59b1a8fb758b2"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience"
            ADD CONSTRAINT "FK_74a747f37d7b2c8432137d98178" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience"
            ADD CONSTRAINT "FK_fb4a6fe6b3f0ac7e2230e3dd91a" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "streak"
            ADD CONSTRAINT "FK_34550648721dee4ee200c9b0b8c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "streak"
            ADD CONSTRAINT "FK_6c87c9248a8db841d17faf9764b" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_c9dff67fdc38e5843a8cfb376ec" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_83e440392ef89718026b296c75e" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_20e92181a2144551cf5fbbc8400" FOREIGN KEY ("streakId") REFERENCES "streak"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_487e5804508d604c5c79fe16c1c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_417e7bdae7694e49fc7b7b35bdc" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_6c0cc3ffdfa1a3dc83486041c7a" FOREIGN KEY ("habitTaskId") REFERENCES "habit_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD CONSTRAINT "FK_999000e9ce7a69128f471f0a3f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD CONSTRAINT "FK_cc3832692d337c59b1a8fb758b2" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
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
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_6c0cc3ffdfa1a3dc83486041c7a"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_417e7bdae7694e49fc7b7b35bdc"
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction" DROP CONSTRAINT "FK_487e5804508d604c5c79fe16c1c"
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
            ALTER TABLE "streak" DROP CONSTRAINT "FK_6c87c9248a8db841d17faf9764b"
        `);
        await queryRunner.query(`
            ALTER TABLE "streak" DROP CONSTRAINT "FK_34550648721dee4ee200c9b0b8c"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience" DROP CONSTRAINT "FK_fb4a6fe6b3f0ac7e2230e3dd91a"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience" DROP CONSTRAINT "FK_74a747f37d7b2c8432137d98178"
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD CONSTRAINT "FK_cc3832692d337c59b1a8fb758b2" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit"
            ADD CONSTRAINT "FK_999000e9ce7a69128f471f0a3f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_6c0cc3ffdfa1a3dc83486041c7a" FOREIGN KEY ("habitTaskId") REFERENCES "habit_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_417e7bdae7694e49fc7b7b35bdc" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "experience_transaction"
            ADD CONSTRAINT "FK_487e5804508d604c5c79fe16c1c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_20e92181a2144551cf5fbbc8400" FOREIGN KEY ("streakId") REFERENCES "streak"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_83e440392ef89718026b296c75e" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "habit_task"
            ADD CONSTRAINT "FK_c9dff67fdc38e5843a8cfb376ec" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "streak"
            ADD CONSTRAINT "FK_6c87c9248a8db841d17faf9764b" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "streak"
            ADD CONSTRAINT "FK_34550648721dee4ee200c9b0b8c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience"
            ADD CONSTRAINT "FK_fb4a6fe6b3f0ac7e2230e3dd91a" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_category_experience"
            ADD CONSTRAINT "FK_74a747f37d7b2c8432137d98178" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
