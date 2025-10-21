import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuestionsTable1761032362078 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "question_type_enum" AS ENUM(
                'multiple_choice',
                'true_false',
                'essay',
                'short_answer',
                'fill_blanks'
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "questions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "examId" uuid NOT NULL,
                "question" text NOT NULL,
                "type" "question_type_enum" NOT NULL DEFAULT 'multiple_choice',
                "options" json,
                "correctAnswer" text,
                "explanation" text,
                "marks" integer NOT NULL DEFAULT 1,
                "order" integer NOT NULL DEFAULT 0,
                "isActive" boolean NOT NULL DEFAULT true,
                "uploadedFileId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_35d0c9b7e8ca0fb5e3a8e4b8e4" ON "questions" ("examId")
        `);

    await queryRunner.query(`
            ALTER TABLE "questions"
            ADD CONSTRAINT "FK_35d0c9b7e8ca0fb5e3a8e4b8e4"
            FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_35d0c9b7e8ca0fb5e3a8e4b8e4"`
    );
    await queryRunner.query(`DROP INDEX "IDX_35d0c9b7e8ca0fb5e3a8e4b8e4"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TYPE "question_type_enum"`);
  }
}
