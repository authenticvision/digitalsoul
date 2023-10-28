import React, { useState, useEffect } from "react"
import NextHead from 'next/head.js'

import { AppLayout, Loading } from '@/components/ui'

import { NFTList } from '@/components/nfts'

import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { auth } from 'auth'

import prisma from '@/lib/prisma'

export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)
	let nfts = []

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			}
		}
	}

	const wallet = await prisma.wallet.findUnique({
		where: {
			address: session.address
		}
	})

	const contracts = await prisma.contract.findMany({
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

	return {
		props: {
			contracts,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const Studio = ({ contracts, ...props }) => {
	const [contractId, setContractId] = useState(contracts[0].id)
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			Router.push('/')
		}
	})

	const onChangeContract = ({ contractId }) => {
		console.log(contractId)
		setContractId(contractId)
	}

	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio</title>
			</NextHead>
			<AppLayout contracts={contracts} contractId={contractId} onChange={onChangeContract}>
				<div className="page container w-full ">
					<main className="flex flex-col">
						<NFTList contractId={contractId} />
					</main>
				</div>
			</AppLayout>
		</>
	)
}

export default Studio
