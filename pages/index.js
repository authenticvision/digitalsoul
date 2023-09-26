import React, { useState, useEffect } from "react"
import Router from 'next/router'
import Image from 'next/image'
import prisma from "@/lib/prisma"
import { GetStaticProps } from "next"
import { useAccount, useDisconnect } from 'wagmi'
import Layout from "../components/Layout"
import Logo from "../components/Logo"
import Button from "../components/Button"
import NextHead from 'next/head.js'

const Landing = (props) => {
	const { address, connector, isConnected } = useAccount()
	const { disconnect } = useDisconnect()

	// Use the useState and useEffect hooks to track whether the component has mounted or not
	const [hasMounted, setHasMounted] = useState(false)
	useEffect(() => {
		setHasMounted(true)
	}, [])

	// If the component has not mounted yet, return null
	if (!hasMounted) {
		return null
	}

	const onDisconnect = () => {
		console.log("User Disconnected")

		disconnect()
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
						<h1 className="text-2xl font-bold">Welcome!</h1>
						<p className="text-center">
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam, quis
							nostrud exercitation ullamco laboris nisi ut aliquip
							ex ea commodo consequat. Duis aute irure dolor
							in reprehenderit in voluptate velit esse cillum
							dolore eu fugiat nulla pariatur. Excepteur sint
							occaecat cupidatat non proident, sunt in culpa
							qui officia deserunt mollit anim id est laborum.
						</p>
					</div>

					<div className="text-center mt-5">
						{isConnected ? (
							<div className="">
								<h2 className="text-lg my-5">Connected with {address}</h2>

								<Button text="Disconnect" onClick={onDisconnect} />
							</div>
						) : (
							<Button href="/auth" text="Connect" />
						)}
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Landing
