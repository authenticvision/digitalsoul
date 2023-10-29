import Link from 'next/link'
import { formatAddress } from '@/lib/utils'
import { TraitsBox } from '@/components/studio'

const NFTView = ({ nft, wallet, contract, ...props }) => {

	return (
		<>
			<div className="flex border-b border-raven-700">
				<div className="flex w-full ml-8 mt-8">
					<div className="flex flex-row justify-between items-center w-full pl-8 pb-8">
						<div className="flex flex-col items-start">
							<div className="text-gray-400 text-sm font-normal breadcrumbs">
								<ul>
									<li>
										<Link href={`/studio/${contract.csn.toLowerCase()}`}>
											{contract.name}
										</Link>
									</li>
									<li>NFTs</li>
								</ul>
							</div>

							<div className="font-bold text-4xl">
								{nft.slid}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex w-9/12 ml-8 mt-8 mb-8">
				<div className="grid">
					<div className="flex items-center justify-center flex-col lg:flex-row">
						<img src="/nft-fallback-cover.webp" className="max-w-sm rounded-lg shadow-2xl" />

						<div className="ml-8">
							<h1 className="text-2xl text-gray-400">
								owned by <span className="font-bold text-white">
									{formatAddress(wallet.address)}
								</span>
							</h1>
							<div className="py-6 w-full">
								<TraitsBox nft={nft} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default NFTView
