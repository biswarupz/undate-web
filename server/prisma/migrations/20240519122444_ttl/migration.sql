-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "ttl" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '1 day');
