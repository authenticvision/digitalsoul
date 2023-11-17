/*
  Warnings:

  - A unique constraint covering the columns `[default_nft_id]` on the table `contracts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `settings` to the `contracts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "default_nft_id" TEXT,
ADD COLUMN     "settings" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "nfts" ALTER COLUMN "metadata" DROP NOT NULL;

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "asset_hash" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contract_id" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssetToNFT" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssetToNFT_AB_unique" ON "_AssetToNFT"("A", "B");

-- CreateIndex
CREATE INDEX "_AssetToNFT_B_index" ON "_AssetToNFT"("B");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_default_nft_id_key" ON "contracts"("default_nft_id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_default_nft_id_fkey" FOREIGN KEY ("default_nft_id") REFERENCES "nfts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToNFT" ADD CONSTRAINT "_AssetToNFT_A_fkey" FOREIGN KEY ("A") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToNFT" ADD CONSTRAINT "_AssetToNFT_B_fkey" FOREIGN KEY ("B") REFERENCES "nfts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
