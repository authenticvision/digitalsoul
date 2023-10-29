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

	const { csn } = context.query

	const wallet = await prisma.wallet.findUnique({
		where: {
			address: session.address
		},
		select: {
			id: true,
			address: true
		}
	})

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

	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio</title>
			</NextHead>
			<AppLayout wallet={wallet} contractId={contract.id}>
				<div className="page container w-full ">
					<main className="flex flex-col">
						<NFTList contractId={contract.id} />
					</main>
				</div>
			</AppLayout>
		</>
	)
}

export default Studio
