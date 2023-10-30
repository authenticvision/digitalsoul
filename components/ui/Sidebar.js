import React, { useState, useEffect } from 'react'
import { Button, Loading } from '@/components/ui'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContracts } from '@/hooks/useContracts'

const Sidebar = ({ address, ...props }) => {
	const router = useRouter()
	const { csn } = router.query
	const { contracts, isLoading, error } = useContracts(csn, address)

	const currentContract = contracts
		.find((item) => item.csn.toLowerCase() == csn)

	const contractClasses = (contractId) => cn(
		'font-bold link',
		currentContract.id == contractId ? 'text-white' : 'link-hover text-gray-400'
	)

	const contractSubItemsClasses = (contractId) => cn(
		'font-bold ml-4 mt-2 link',
		currentContract.id == contractId ? 'link text-white' : 'link-hover text-gray-400',
	)

	return (
		<aside className="flex flex-col min-h-[calc(100vh_-_2rem)] h-full w-56 border-r border-raven-700 pt-6">
			<div className="flex flex-col justify-between w-full min-h-full">
				{isLoading && (
					<div className="w-full text-center">
						<Loading size='lg' />
					</div>
				)}

				{!isLoading && (
					<>
						{contracts.length > 0 ? (
							<div className="flex ml-4 flex-col">
								{contracts.map((contract) => (
									<div key={contract.id} className="flex flex-col mb-6">
										<Link href={`/studio/${contract.csn.toLowerCase()}`}
											  className={contractClasses(contract.id)}>
											{contract.name}
										</Link>

										<Link href={`/studio/${contract.csn.toLowerCase()}`}
											  className={contractSubItemsClasses(contract.id)}>
											NFTs
										</Link>

										<div className="text-gray-600 font-bold ml-4 mt-2 cursor-not-allowed" disabled>
											Config
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="ml-4 mb-5">
								It appears that you don't have any contract imported into
								DigitalSoul.
							</div>
						)}

						<div className="flex justify-end text-center align-end mb-5">
							<Button href="/contracts" text="Import new contract" />
						</div>
					</>
				)}
			</div>
		</aside>
	)
}

export default Sidebar
