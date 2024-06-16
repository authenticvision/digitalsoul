import { truncate, formatAddress, cn, discoverPrimaryAsset, generateAssetURL, generateCollectionURL } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import NFTCaption from './NFTCaption'
import {Button} from '@/components/ui'
import {MobilePreview} from '@/components/studio'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'

const NFTCard = ({ nft, contractName, staticCaption, ...props }) => {
	const cardRootClassName = cn(`
		card card-compact rounded-lg w-64 shadow-xl border
		transition ease-in-out
		hover:border-white
		relative
		`
	)

	
	const primaryAsset = discoverPrimaryAsset(nft)
	const assetURL  = primaryAsset ? generateAssetURL(nft.contract.csn, primaryAsset?.asset?.assetHash) : null

	return (
		<div className={cardRootClassName}>		
				<figure className="w-[254px] h-[254px] object-cover relative">
					{primaryAsset ? (
						<Image src={assetURL}
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							fill alt={nft.metadata?.description} />
					) : (
						<Image src="/nft-fallback-cover.webp" fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								alt={nft.metadata?.description} />
					)}
				</figure>
					<div className="absolute top-0 right-0 flex space-x-2 p-2 z-1">
						{((nft.slid != "0") /* do not show for Default-NFT */ && <MobilePreview url = {generateCollectionURL(nft)}>
							<Button btnType="button" className="btn-circle glass">
										<EyeIcon className="h-6 w-6" />
							</Button>
						</MobilePreview>)}
						<Link href={`/studio/${nft.contract.csn.toLowerCase()}/${nft.anchor}/edit`}>
							<Button btnType="button" className="btn-circle glass">
											<PencilIcon className="h-6 w-6" />
								</Button>
						</Link>
					</div>
				<div className="card-body pb-[5px]">
					<div className="flex flex-row items-end justify-between">
						<NFTCaption nft={nft} staticCaption={staticCaption} />
					</div>
				</div>
			
		</div>
	)
}

export default NFTCard
