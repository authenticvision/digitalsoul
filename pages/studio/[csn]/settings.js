import NextHead from 'next/head'
import Link from 'next/link'

import { AppLayout, Loading, ErrorPage } from '@/components/ui'
import { NFTCard } from '@/components/studio'
import { EditableContractSettings } from '@/components/studio'
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
			settings: true,
		}
	})

	const defaultNFT = await prisma.NFT.findFirst({
		where: {
			contractId: contract.id,
			anchor: 'default'
		},
		include: {
			contract: true,
			assets: true
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
			wallet: wallet,
			contract,
			defaultNFT: JSON.parse(JSON.stringify(defaultNFT)),
			session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
		}
	}
}

const ContractConfig = ({ defaultNFT, wallet, contract, ...props }) => {
	if (props.forbidden) {
		return (
			<ErrorPage status={403} />
		)
	}
	
	return (
		<>
			<NextHead>
				<title>DigitalSoul - Studio - Settings of {contract.name}</title>
			</NextHead>
			<AppLayout wallet={wallet}>
				<div className="page w-full ">
					<main className="flex flex-col">
						<span className="text-center w-full text-xl font-bold mt-5">
							<div className="flex border-b border-raven-700">
								<div className="flex w-full ml-8 mt-8 max-w-s">
									<div className="flex flex-row justify-between items-center w-full pl-8 pb-8">
										<div className="flex flex-col items-start">
											<div className="text-gray-400 text-sm font-normal breadcrumbs">
												<ul>
													<li>
														<Link href={`/studio/${contract.csn.toLowerCase()}`}>
															{contract.name}
														</Link>
													</li>
													<li>Settings</li>
												</ul>
											</div>

											<div className="font-bold text-4xl">
												{contract.name}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="flex justify-between w-9/12 ml-8 mt-8 mb-8">
								<div className="flex flex-col w-full">
									<div className="form-control w-full">
										<label className="label">
											<span className="label-text">Contract Name</span>
										</label>
										<input type="text" value={contract.name}
											readOnly
											className="input input-bordered w-full text-raven-500" />
									</div>

									<div className="form-control w-full ">
										<label className="label">
											<span className="label-text">Contract CSN</span>
										</label>
										<input type="text" value={contract.csn}
											readOnly
											className="input input-bordered w-full text-raven-500" />
									</div>

									<div className="form-control w-full ">
										<label className="label">
											<span className="label-text">Contract Address</span>
										</label>
										<input type="text" value={contract.address}
											readOnly
											className="input input-bordered w-full text-raven-500" />
									</div>

									<hr className="mt-8 mb-4 border-raven-900"/>

									<EditableContractSettings contract={contract} wallet={wallet} />
								</div>

								<div className="flex ml-8">
									<NFTCard nft={defaultNFT} />
								</div>
							</div>

						</span>
					</main>
				</div>
			</AppLayout>
		</>
	)
}

export default ContractConfig
