const NFTLinks = ({assetData, ...props}) => (
	<div className="flex items-center overflow-auto w-full font-mono p-2 rounded text-white mt-5">
		<span>
            {assetData.links.opensea ? <a href={assetData.links.opensea}>View on OpenSea</a> : ""}
		</span>
	</div>
)

export default NFTLinks
