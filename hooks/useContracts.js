import React, { useState, useEffect } from 'react'

export const useContracts = (csn, address) => {
	const [contracts, setContracts] = useState([])
	const [error, setError] = useState()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchContracts() {
			try {
				const response = await fetch(`/api/internal/wallets/${address}/contracts`)
				const data = await response.json()

				setContracts(data.contracts)
				setIsLoading(false)
			} catch (error) {
				setError(error)
			}
		}

		fetchContracts()
	}, [csn, address])

	return {
		error,
		isLoading,
		contracts
	}
}
