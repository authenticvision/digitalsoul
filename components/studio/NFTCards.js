import { NFTCard } from '@/components/studio'

const NFTCards = ({ nfts, contractName, ...props }) => {
	return (
		<div className="grid grid-cols-4 grid-rows-4 gap-6 pb-4">
			{nfts.map((nft) => (
				<NFTCard nft={nft} contractName={contractName} />
			))}
		</div>
	)

}

export default NFTCards
