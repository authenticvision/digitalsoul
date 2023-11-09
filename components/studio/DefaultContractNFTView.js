import { NFTImageEdit } from '@/components/studio'
import { cn, truncate, generateAssetURL } from '@/lib/utils'

const DefaultContractNFTView = ({ contract, nft, onFinishEdit, ...props }) => {
	const cardRootClassName = cn(`
		card card-compact rounded-lg bg-shark-900 shadow-xl border
		transition ease-in-out relative
		border-raven-700 hover:border-white
		`
	)

	const hasAssets = nft.assets?.length > 0
	const assetURL  = hasAssets ? generateAssetURL(nft.assets[0].assetHash) : null

	return (
		<div className={cardRootClassName}>
			<figure className="w-[350px] h-[350px] object-cover">
				<NFTImageEdit nft={nft} onFinishEditing={onFinishEdit} />
			</figure>
			<div className="card-body pb-[5px] z-20 bg-[#303a4a] rounded">
				<div className="flex flex-row items-end justify-between">
					<div className="flex flex-col text-left">
						<div className="w-full text-gray-400 text-xs">
							{truncate(nft.contract?.name, 22)}
						</div>
						<div className="font-bold text-lg">Default NFT</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DefaultContractNFTView
