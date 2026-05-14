-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "transcriberEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "CallLog" ADD COLUMN     "outcome" TEXT;
