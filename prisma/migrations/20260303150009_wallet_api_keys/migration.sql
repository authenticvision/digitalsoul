/*
  Warnings:

  - A unique constraint covering the columns `[api_key_hash]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."wallets" ADD COLUMN     "api_key_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_api_key_hash_key" ON "public"."wallets"("api_key_hash");
