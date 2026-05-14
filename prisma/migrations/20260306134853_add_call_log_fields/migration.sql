-- AlterTable
ALTER TABLE "CallLog" ADD COLUMN     "agentId" TEXT,
ADD COLUMN     "customerNumber" TEXT,
ADD COLUMN     "disconnectionReason" TEXT,
ADD COLUMN     "transferTarget" TEXT;

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
