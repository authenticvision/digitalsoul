-- CreateTable
CREATE TABLE "assets_nfts" (
    "asset_id" TEXT NOT NULL,
    "nft_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,

    CONSTRAINT "assets_nfts_pkey" PRIMARY KEY ("asset_id","nft_id")
);

-- AddForeignKey
ALTER TABLE "assets_nfts" ADD CONSTRAINT "assets_nfts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets_nfts" ADD CONSTRAINT "assets_nfts_nft_id_fkey" FOREIGN KEY ("nft_id") REFERENCES "nfts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
