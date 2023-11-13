import NextHead from 'next/head.js'

import { AppLayout, Loading, ErrorPage } from '@/components/ui'
import { auth } from 'auth'

import prisma from '@/lib/prisma'

export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			}
		}
	}

	let contract = await prisma.contract.findFirst({
		where: {
			ownerId: session.wallet.id
		},
		select: {
			id: true,
			name: true,
			csn: true
		}
	})

	if (contract) {
		return {
			redirect: {
				destination: `/studio/${contract.csn.toLowerCase()}`,
				permanent: false,
			}
		}
	}

	return {
		props: {
			wallet: session.wallet
		}
	}
}

const StudioIndex = ({ wallet, ...props }) => {
	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio</title>
			</NextHead>
			<AppLayout wallet={wallet}>
				<div className="page w-full ">
					<main className="flex flex-col">
						<span className="text-center w-full text-xl font-bold mt-5">
							You don't appear to have claimed any contract yet
						</span>
					</main>
				</div>
			</AppLayout>
		</>
	)
}

export default StudioIndex
