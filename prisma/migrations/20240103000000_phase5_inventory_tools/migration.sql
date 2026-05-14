-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "tools" TEXT;

-- AlterTable
ALTER TABLE "PhoneNumber" ALTER COLUMN "agentId" DROP NOT NULL;
