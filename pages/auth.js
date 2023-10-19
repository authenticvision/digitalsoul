import React, { useState } from 'react'
import Router from 'next/router'
import { useConnect, useAccount, useSignMessage } from 'wagmi'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { Layout, Logo, Button } from '@/components/ui'
import Setup from '@/components/Setup'
import NextHead from 'next/head.js'

export const getServerSideProps = async ({ req }) => {
	const configCount = await prisma.config.count()
	const isConfigured = configCount > 0;
	const signMessageText = process.env.SIGN_MESSAGE_TEXT

	return {
		props: { isConfigured, signMessageText }
	}
}

const Auth = (props) => {
	const [showLoading, setShowLoading] = useState(false)
	const { connect, connectAsync, connectors, error, isLoading, pendingConnector } =
		useConnect()

	const { address, connector, isConnected } = useAccount()

	const onConnect = async({ connector }) => {
		let callbackUrl = '/'

		if (!props.isConfigured) {
			callbackUrl = '/setup'
		}

		if (address) {
			signIn('credentials', { address: address, callbackUrl })

			return
		}

		const { account, error } = await connectAsync({ connector })

		if (error) {
			// TODO: Display error
			throw error
		}

		signIn('credentials', { address: account, callbackUrl })
	}

	return (
		<Layout>
			<NextHead>
				<title>MetaAnchor - Login with Wallet</title>
			</NextHead>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col justify-center align-center">
					<div className="flex justify-center py-2">
						<Logo />
					</div>
					<div className="text-center">
						<h1 className="text-2xl font-bold">
							Choose a Wallet Provider below
						</h1>
					</div>

					<div className="flex flex-col w-full">
						<div className="w-full items-center justify-center text-center mt-5">
							{connectors.map((connector) => (
								<Button text={`Connect with ${connector.name}`}
										onClick={() => onConnect({ connector })}
										key={connector.id} />
							))}

							{error && <div>{error.message}</div>}
						</div>
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Auth
