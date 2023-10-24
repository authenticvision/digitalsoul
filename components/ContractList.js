import React, { useCallback, useState, useEffect, Suspense } from 'react'
import MetaAnchor from '@/lib/api.metaanchor.io'

import { Button } from '@/components/ui'

const ContractList = ({ availableContracts = [], claimedContracts = [], onSave, ...props }) =>  {
	const [selectedContracts, setSelectedContracts] = useState([...claimedContracts]);

	const isContractClaimed = (contract) => {
		return Boolean(
			selectedContracts
			.find((claimedContract) => claimedContract.csn == contract.csn)
		)
	}

	const changeContractStatus = contract => {
		const isAdded = Boolean(selectedContracts
			.find((selContract) => selContract.csn == contract.csn))

		if (isAdded) {
			const contractsLeft = selectedContracts
				.filter((item) => item.csn == contract.cns)
			setSelectedContracts([...contractsLeft])
		} else {
			setSelectedContracts([...selectedContracts, contract])
		}
	}

	const claimContracts = (e) => {
		e.preventDefault()

		onSave(selectedContracts)
	}

	return (
		<section>
			<Suspense fallback={<p>Loading contracts...</p>}>
				<h1 className="text-xl">Contracts available for your wallet</h1>
				<div className="flex flex-col">
					<div>
						{availableContracts.map((contract) => (
							<div key={contract.csn} className="flex w-full px-3 py-2 cursor-pointer
											text-white bg-slate-500 rounded mt-2">
								<input type="checkbox"
										checked={isContractClaimed(contract)}
										className="h-6 w-6 mr-3" onChange={(e) => changeContractStatus(contract)} />
								{contract.contract_name}
							</div>
						))}

						<div className="mt-5">
							<Button btnType="button" onClick={claimContracts} text="Save" />
						</div>
					</div>
				</div>
			</Suspense>
		</section>
	)
}

export default ContractList
