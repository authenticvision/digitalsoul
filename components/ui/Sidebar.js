import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const Sidebar = ({ contracts, contractId, onChange, ...props }) => {

	const contractClasses = (currentContractId) => {
		return cn(
			'font-bold link',
			currentContractId == contractId ? 'text-white' : 'link-hover text-gray-400'
		)
	}

	const contractSubItemsClasses = (currentContractId) => (
		cn(
			'font-bold ml-4 mt-2 link',
			currentContractId == contractId ? 'link text-white' : 'link-hover text-gray-400',
		)
	)

	const selectContract = (contract) => {
		// XXX: Right now, both send it back to the same place, since "Config" tab
		// doesn't exist right now.
		console.log(contract)
		onChange({ contractId: contract.id })
	}

	return (
		<aside className="flex flex-col h-[calc(100vh_-_2rem)] w-56 border-r border-raven-700 pt-6">
			<div className="flex flex-col justify-between w-full min-h-full">
				{contracts.length ? (
					<div className="flex ml-4">
						{contracts.map((contract) => (
							<div key={contract.id}>
								<div className={contractClasses(contract.id)}
									 onClick={selectContract(contract)}>
									{contract.name}
								</div>

								<div className={contractSubItemsClasses(contract.id)}
									 onClick={selectContract(contract)}>
									NFTs
								</div>

								<div className="text-gray-600 font-bold ml-4 mt-2 cursor-not-allowed" disabled>
									Config
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="mb-5">
						It appears that you don't have any contract imported into
						DigitalSoul.
					</div>
				)}

				<div className="flex justify-end text-center align-end mb-5">
					<Button href="/contracts" text="Import new contract" />
				</div>
			</div>
		</aside>
	)
}

export default Sidebar
