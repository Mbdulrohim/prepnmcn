import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailsTable1761630226630 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "emails" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "messageId" character varying(255) NOT NULL,
        "from" character varying(255) NOT NULL,
        "to" json NOT NULL,
        "subject" character varying(255) NOT NULL,
        "textBody" text,
        "htmlBody" text,
        "attachments" json,
        "receivedAt" TIMESTAMP NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "isArchived" boolean NOT NULL DEFAULT false,
        "folder" character varying(50) NOT NULL DEFAULT 'inbox',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_messageId" UNIQUE ("messageId"),
        CONSTRAINT "PK_emails" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_emails_receivedAt" ON "emails" ("receivedAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_emails_folder" ON "emails" ("folder")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_emails_folder"`);
    await queryRunner.query(`DROP INDEX "IDX_emails_receivedAt"`);
    await queryRunner.query(`DROP TABLE "emails"`);
  }
}
