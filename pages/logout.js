import React, { useState, useEffect } from "react"
import Router from 'next/router'
import NextHead from 'next/head.js'

import { useSession, signOut } from 'next-auth/react'
import { useDisconnect } from 'wagmi'
import { auth } from "auth"

import { Layout, Loading } from "@/components/ui"

export async function getServerSideProps(context) {
	const session = await auth(context.req, context.res)

	if (!session) {
		return {
			redirect: {
				destination: '/',
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
	const { disconnectAsync } = useDisconnect()
	const { data: session, status } = useSession()

	const disconnect = async(e) => {
		await disconnectAsync()
		signOut()
	}

	useEffect(() => {
		disconnect()
	}, [])

	return (
		<Layout>
			<NextHead>
				<title>DigitalSoul-Studio - Logout</title>
			</NextHead>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="hero min-h-screen">
						<div className="hero-content text-center">
							<div className="max-w-md">
								<div className="mb-6">
									<Loading size='lg' />
								</div>

								<p className="py-6">
									Logging you out...
								</p>
							</div>
						</div>
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Landing
