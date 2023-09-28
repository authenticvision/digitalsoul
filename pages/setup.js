import React, { useState, useEffect } from "react"
import Router from 'next/router'
import Image from 'next/image'
import prisma from "@/lib/prisma"
import { useAccount, useDisconnect } from 'wagmi'
import Layout from "../components/Layout"
import Logo from "../components/Logo"
import Button from "../components/Button"
import SetupComponent from "../components/Setup"
import NextHead from 'next/head.js'

export const getServerSideProps = async ({ req }) => {
	const signMessageText = process.env.SIGN_MESSAGE_TEXT

	return {
		props: { signMessageText }
	}
}

const Setup = (props) => {
	const { address, connector, isConnected } = useAccount()

	// Use the useState and useEffect hooks to track whether the component has mounted or not
	const [hasMounted, setHasMounted] = useState(false)
	useEffect(() => {
		setHasMounted(true)
	}, [])

	// If the component has not mounted yet, return null
	if (!hasMounted) {
		return null
	}

	const onDoneSign = () => {
		Router.push('/')
	}

	return (
		<Layout>
			<NextHead>
				<title>Welcome to MetaAnchor</title>
			</NextHead>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="flex justify-center py-2">
						<Logo />
					</div>
					<div className="text-center">
						<SetupComponent signMessageText={props.signMessageText}
										onDone={onDoneSign} />
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Setup
