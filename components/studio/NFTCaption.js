import { formatAddress} from '@/lib/utils'


const NFTCaption = ({ nft, staticCaption, ...props }) => {
    // Enforce a static caption for Default-NFTs
    staticCaption = nft.anchor=='default' ? 'DEFAULT-NFT' : staticCaption

    // TODO this shall not have static formatting but rather be usable in different locations, which
    // will require different font sizes etc.
	return (   
        <div className="flex flex-row items-end justify-between">
        {staticCaption ? (
            <div className="font-bold text-lg">{staticCaption}</div>
        ) : (            
                <div className="flex flex-col text-left">
                    <div className="w-full text-gray-400 text-xs">
                        {formatAddress(nft.anchor, 22)}
                    </div>
                    <div className="font-bold text-lg">{nft.slid}</div>
                </div>
        )}
        </div>        
	)
}

export default NFTCaption
