-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "timezone" TEXT;

-- AlterTable
ALTER TABLE "PhoneNumber" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
-- AlterTable
ALTER TABLE "PhoneNumber" ADD COLUMN "activatedAt" TIMESTAMP(3);
