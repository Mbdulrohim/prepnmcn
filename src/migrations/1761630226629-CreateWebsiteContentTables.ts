import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWebsiteContentTables1761630226629
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create community_voices table
    await queryRunner.query(`
            CREATE TABLE "community_voices" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "role" character varying(255) NOT NULL,
                "institution" character varying(255) NOT NULL,
                "content" text NOT NULL,
                "imageUrl" character varying(500),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_community_voices" PRIMARY KEY ("id")
            )
        `);

    // Create campus_stories table
    await queryRunner.query(`
            CREATE TABLE "campus_stories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "institution" character varying(255) NOT NULL,
                "content" text NOT NULL,
                "imageUrl" character varying(500),
                "author" character varying(255) NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_campus_stories" PRIMARY KEY ("id")
            )
        `);

    // Create learner_testimonials table
    await queryRunner.query(`
            CREATE TABLE "learner_testimonials" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "program" character varying(255) NOT NULL,
                "institution" character varying(255) NOT NULL,
                "content" text NOT NULL,
                "imageUrl" character varying(500),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_learner_testimonials" PRIMARY KEY ("id")
            )
        `);

    // Create blog_posts table
    await queryRunner.query(`
            CREATE TABLE "blog_posts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "content" text NOT NULL,
                "excerpt" text NOT NULL,
                "author" character varying(255) NOT NULL,
                "category" character varying(100) NOT NULL,
                "tags" text NOT NULL,
                "imageUrl" character varying(500),
                "isPublished" boolean NOT NULL DEFAULT false,
                "publishedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_blog_posts" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TABLE "learner_testimonials"`);
    await queryRunner.query(`DROP TABLE "campus_stories"`);
    await queryRunner.query(`DROP TABLE "community_voices"`);
  }
}
