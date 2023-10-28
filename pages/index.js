import React, { useState, useEffect } from "react"
import Router from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import prisma from "@/lib/prisma"
import { GetStaticProps } from "next"
import { useSession, signOut } from 'next-auth/react'
import { useAccount, useDisconnect } from 'wagmi'
import NextHead from 'next/head.js'
import { auth } from "auth"

import { Layout, Logo, Button } from "@/components/ui"

export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)

	if (session) {
		return {
			redirect: {
				destination: '/studio',
				permanent: false,
			}
		}
	} else {
		return {
			props: {}
		}
	}
}

const Landing = (props) => {
	const { data: session, status } = useSession()

	// Use the useState and useEffect hooks to track whether the component
	// has mounted or not
	const [hasMounted, setHasMounted] = useState(false)
	useEffect(() => {
		setHasMounted(true)
	}, [])

	// If the component has not mounted yet, return null
	if (!hasMounted) {
		return null
	}

	return (
		<Layout>
			<NextHead>
				<title>Welcome to DigitalSoul-Studio</title>
			</NextHead>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="hero min-h-screen bg-base-200">
						<div className="hero-content text-center">
							<div className="max-w-md">
								<h1 className="text-5xl font-bold">
									Welcome to DigitalSoul-Studio
								</h1>

								<p className="py-6">

									DigitalSoul-Studio is the tool to interact
									and customize your collection of assets
									from MetaAnchor!

								</p>

								{!session && (
									<Button href="/auth" text="Connect" />
								)}
							</div>
						</div>
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Landing
