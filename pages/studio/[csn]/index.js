import React, { useState, useEffect } from "react"
import NextHead from 'next/head.js'

import { AppLayout, Loading, ErrorPage } from '@/components/ui'

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

	const { csn } = context.query

	const wallet = { id: session.wallet.id, address: session.wallet.address }

	const contract = await prisma.contract.findFirst({
		where: {
			ownerId: wallet.id,
			csn: {
				equals: csn,
				mode: 'insensitive'
			}
		},
		select: {
			id: true,
			name: true,
			csn: true,
			address: true,
			network: true
		}
	})

	if (!contract) {
		return {
			props: {
				forbidden: true
			}
		}
	}

	return {
		props: {
			wallet,
			contract,
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const Studio = ({ wallet, contract, ...props }) => {
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			Router.push('/')
		}
	})

	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}

	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio</title>
			</NextHead>
			<AppLayout wallet={wallet} contractId={contract.id}>
				<div className="page w-full ">
					<main className="flex flex-col">
						<NFTList contractId={contract.id} contractName={contract.name} />
					</main>
				</div>
			</AppLayout>
		</>
	)
}

export default Studio
