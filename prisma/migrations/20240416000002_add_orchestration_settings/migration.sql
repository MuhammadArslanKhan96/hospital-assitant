-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "fillerInjectionEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "Agent" ADD COLUMN "backchannelingEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "Agent" ADD COLUMN "interruptionThreshold" DOUBLE PRECISION DEFAULT 0.1;
