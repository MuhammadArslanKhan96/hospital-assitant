-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "firstMessage" TEXT DEFAULT 'Hello, how can I help you?';
ALTER TABLE "Agent" ADD COLUMN "backgroundSound" TEXT DEFAULT 'off';
