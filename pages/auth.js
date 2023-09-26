import React, { useState } from 'react'
import Router from 'next/router'
import { useConnect, useAccount, useSignMessage } from 'wagmi'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Logo from '@/components/Logo'
import Button from '@/components/Button'
import Setup from '@/components/Setup'
import NextHead from 'next/head.js'

export const getServerSideProps = async ({ req }) => {
	const isConfigured = await prisma.config.count()
	const signMessageText = process.env.SIGN_MESSAGE_TEXT

	return {
		props: { isConfigured, signMessageText }
	}
}

const Auth = (props) => {
	const [showLoading, setShowLoading] = useState(false)
	const { connect, connectors, error, isLoading, pendingConnector } =
		useConnect()

	const { address, connector, isConnected } = useAccount()

	const registerWallet = async() => {
		try {
			const body = {
				wallet: { address }
			}

			await fetch('/api/wallets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			await Router.push('/')
		} catch (error) {
			console.error(error)
		}
	}

	const onConnect = ({ connector }) => {
		if (props.isConfigured) {
			registerWallet()

			Router.push('/')
		}

		connect({ connector })
	}

	const onDoneSign = (data) => {
		console.log(data)
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
						{isConnected ? (
							<Setup signMessageText={props.signMessageText} onDone={onDoneSign} />
						) : (
							<div className="w-full items-center justify-center text-center mt-5">
								{connectors.map((connector) => (
									<Button text={`Connect with ${connector.name}`}
											onClick={() => onConnect({ connector })}
											key={connector.id} />
								))}

								{error && <div>{error.message}</div>}
							</div>
						)}
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Auth
