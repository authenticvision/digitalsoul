import Link from 'next/link'

const StudioHeader = ({ contract, nft, staticCaption }) => (
	<div className="flex border-b border-raven-700">
		<div className="flex w-full ml-8 mt-8">
			<div className="flex flex-row justify-between items-center w-full pl-8 pb-8">
				<div className="flex flex-col items-start w-full">
					<div className="text-gray-400 text-sm font-normal breadcrumbs">
						<ul>
							<li>
								<Link href={`/studio/${contract.csn.toLowerCase()}`}>
									{contract.name}
								</Link>
							</li>
							<li>
								<Link href={`/studio/${contract.csn.toLowerCase()}`}>
									Collection
								</Link>
							</li>
						</ul>
					</div>

					<div className="flex items-center justify-between w-full pr-8">
						<h1 className="font-bold text-4xl">
							{staticCaption ? staticCaption : nft.slid}
						</h1>
					</div>
				</div>
			</div>
		</div>
	</div>
)

export default StudioHeader
