import React, { useState, useEffect } from "react"
import NextHead from 'next/head.js'
import Router from 'next/router'
import Image from 'next/image'
import prisma from "@/lib/prisma"

import { useSession } from 'next-auth/react'
import { useAccount, useDisconnect } from 'wagmi'
import { auth } from "auth"

import Layout from "../components/Layout"
import Logo from "../components/Logo"
import Button from "../components/Button"
import SetupComponent from "../components/Setup"


export async function getServerSideProps(context) {
	const configCount = await prisma.config.count()
	const session = await auth(context.req, context.res)
	const signMessageText = process.env.SIGN_MESSAGE_TEXT

	if (session && configCount == 0) {
		return {
			props: {
				signMessageText,
				configCount,
				session: JSON.parse(JSON.stringify(session)) // XXX: NextJS is dumb
			}
		}
	} else {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
}

const Setup = (props) => {
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			Router.push('/')
		},
	})

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
