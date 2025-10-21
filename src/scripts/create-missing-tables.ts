import { getDataSource } from "../lib/database";

async function createMissingTables() {
  try {
    const dataSource = await getDataSource();

    // Create questions table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "questions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "examId" uuid,
        "question" text NOT NULL,
        "type" "public"."questions_type_enum" NOT NULL DEFAULT 'multiple_choice',
        "options" json,
        "correctAnswer" text,
        "explanation" text,
        "marks" integer NOT NULL DEFAULT '1',
        "order" integer NOT NULL DEFAULT '0',
        "isActive" boolean NOT NULL DEFAULT true,
        "uploadedFileId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id")
      )
    `);

    // Create exam_attempts table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "exam_attempts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "examId" uuid NOT NULL,
        "answers" json,
        "score" integer,
        "totalMarks" integer,
        "timeTaken" integer,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "isCompleted" boolean NOT NULL DEFAULT false,
        "attemptNumber" integer NOT NULL DEFAULT '1',
        "isReviewed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4eb6c7775e0a9c178ef7f4826f9" PRIMARY KEY ("id")
      )
    `);

    // Create challenges table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "challenges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "packageId" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "type" "public"."challenges_type_enum" NOT NULL DEFAULT 'full_challenge',
        "durationDays" integer NOT NULL DEFAULT '7',
        "isPaid" boolean NOT NULL DEFAULT false,
        "price" numeric(10,2),
        "currency" character varying(10) NOT NULL DEFAULT 'NGN',
        "dailyContent" json,
        "enrolledUsers" json,
        "isActive" boolean NOT NULL DEFAULT true,
        "startDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1e664e93171e20fe4d6125466af" PRIMARY KEY ("id")
      )
    `);

    // Create user_enrollments table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "user_enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "packageId" uuid NOT NULL,
        "paymentStatus" "public"."user_enrollments_paymentstatus_enum" NOT NULL DEFAULT 'pending',
        "amountPaid" numeric(10,2),
        "currency" character varying(10) NOT NULL DEFAULT 'NGN',
        "enrolledAt" TIMESTAMP,
        "expiresAt" TIMESTAMP,
        "progressPercentage" numeric(5,2) NOT NULL DEFAULT '0',
        "studyStreak" integer NOT NULL DEFAULT '0',
        "lastActivity" TIMESTAMP,
        "notificationsEnabled" boolean NOT NULL DEFAULT true,
        "completedExams" json,
        "progressData" json,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c9e983acd60efa172fe92840d58" PRIMARY KEY ("id")
      )
    `);

    // Create junction tables
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "challenge_enrollments" (
        "challengeId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_315632710787353be6d603172c0" PRIMARY KEY ("challengeId", "userId")
      )
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "challenge_quizzes" (
        "challengeId" uuid NOT NULL,
        "examId" uuid NOT NULL,
        CONSTRAINT "PK_e11a25da20602ecb8c34c56fd1c" PRIMARY KEY ("challengeId", "examId")
      )
    `);

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "access_code_usage" (
        "accessCodeId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_86ab8c79169e7b39f2e4b3a3c64" PRIMARY KEY ("accessCodeId", "userId")
      )
    `);

    // Create indexes
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_d0398d2040e2c813d21749fc05" ON "challenge_enrollments" ("challengeId")`
    );
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_c007ee83bed0c415b8c280034a" ON "challenge_enrollments" ("userId")`
    );
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_167f87806fcd97b9428b51f65a" ON "challenge_quizzes" ("challengeId")`
    );
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_c8d603a52a4b8e39d04d0c0efe" ON "challenge_quizzes" ("examId")`
    );
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_da27e3b6879b5644b056ff9d84" ON "access_code_usage" ("accessCodeId")`
    );
    await dataSource.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ae2c34dcd0cbda0af30d1b4c4f" ON "access_code_usage" ("userId")`
    );

    console.log("Missing tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}

createMissingTables();
