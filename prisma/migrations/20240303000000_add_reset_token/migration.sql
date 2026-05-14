-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex (Idempotent approach: create if not exists, but Postgres syntax requires a plpgsql block for index if not exists in older versions, so we use a safe drop/create or just standard create if we assume it doesn't exist. Since the columns didn't exist, the index doesn't either.)
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");
