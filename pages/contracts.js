import React, { useCallback, useState, useEffect } from "react"
import Router from 'next/router'
import Image from 'next/image'
import NextHead from 'next/head.js'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { signMessage } from 'wagmi/actions'

import prisma from "@/lib/prisma"
import MetaAnchor from '@/lib/api.metaanchor.io'

import { auth } from "auth"

import ContractList from '@/components/ContractList'
import { Layout, Logo, Button, Alert } from '@/components/ui'

export async function getServerSideProps(context) {
	const config = await prisma.config.findFirst()
	const metaAnchorApiURL = process.env.METAANCHOR_API_URL
	const session = await auth(context.req, context.res)

	const api = new MetaAnchor({
		baseUrl: metaAnchorApiURL,
		apiKey: config.apiKey
	})

	let wallet = null
	let claimedContracts = []
	let availableContracts = []

	if (session) {
		wallet = await prisma.wallet.findUnique({
			where: {
				address: session.address
			}
		})

		claimedContracts = await prisma.contract.findMany({
			where: {
				ownerId: wallet.id
			},
			select: {
				id: true,
				name: true,
				csn: true,
				address: true,
				network: true
			}
		})

		const { data: contractsData, status } = await api
			.getContracts(session.address)

		availableContracts = contractsData
	} else {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}

	return {
		props: {
			availableContracts,
			claimedContracts,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const Contracts = (props) => {
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			Router.push('/')
		},
	})

	const [availableContracts, setAvailableContracts] = useState(
		props.availableContracts
	)
	const [error, setError] = useState()

	// Use the useState and useEffect hooks to track whether the component has
	// mounted or not
	const [hasMounted, setHasMounted] = useState(false)

	useEffect(() => {
		setHasMounted(true)
	}, [])

	// If the component has not mounted yet, return null
	if (!hasMounted) {
		return null
	}

	const signContracts = async(contracts) => {
		return Promise.all(contracts.map(async(contract) => {
			const signedMessageData = await signMessage({
				message: `I own csn=${contract.csn}`
			})

			return { ...contract, signedMessage: signedMessageData }
		}))
	}

	const onSelectContracts = async(selectedContracts) => {
		const signedContracts = await signContracts(selectedContracts)

		const response = await fetch('/api/internal/contracts', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				signedContracts,
				wallet: session.address
			}),
		});

		if (response.status == 201) {
			Router.push('/')
		} else {
			const responseData = await response.json()
			setError(responseData.error)
		}
	}

	return (
		<Layout>
			<NextHead>
				<title>Welcome to MetaAnchor - Contracts</title>
			</NextHead>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="flex justify-center py-2">
						<Logo />
					</div>

					{error && (
						<Alert type='error' text={error} />
					)}

					<div className="text-center">
						<ContractList availableContracts={availableContracts}
									  claimedContracts={props.claimedContracts}
									  onSave={onSelectContracts} />
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Contracts
