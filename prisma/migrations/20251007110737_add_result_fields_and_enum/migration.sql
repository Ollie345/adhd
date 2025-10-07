-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateTable
CREATE TABLE "adhd_assessment" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "consent_timestamp" TIMESTAMP(3),
    "age" INTEGER NOT NULL,
    "marital_status" TEXT NOT NULL,
    "medical_conditions" JSONB NOT NULL DEFAULT '[]',
    "medications" TEXT,
    "family_history" TEXT,
    "responses" JSONB NOT NULL,
    "behavioral_score" INTEGER NOT NULL DEFAULT 0,
    "cognitive_score" INTEGER NOT NULL DEFAULT 0,
    "motor_skills_score" INTEGER NOT NULL DEFAULT 0,
    "language_score" INTEGER NOT NULL DEFAULT 0,
    "overall_risk" "RiskLevel" NOT NULL,
    "flagged_domains" JSONB NOT NULL DEFAULT '[]',
    "message" TEXT NOT NULL DEFAULT '',
    "detailedMessage" TEXT NOT NULL DEFAULT '',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "assessment_type" TEXT NOT NULL DEFAULT 'developmental_screening',
    "completed_at" TIMESTAMP(3),
    "lead_status" TEXT NOT NULL DEFAULT 'new',
    "lead_source" TEXT NOT NULL DEFAULT 'adhd_assessment',
    "follow_up_notes" TEXT,

    CONSTRAINT "adhd_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adhd_assessment_email_key" ON "adhd_assessment"("email");
