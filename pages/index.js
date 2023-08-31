import React from "react"
import Router from 'next/router'
import Image from 'next/image'
import prisma from "@/lib/prisma"
import { GetStaticProps } from "next"
import Layout from "../components/Layout"
import Logo from "../components/Logo"
import Setup from "../components/Setup"

export const getServerSideProps = async ({ req }) => {
	const isConfigured = await prisma.config.count();

	if (isConfigured) {
		return {
			redirect: {
				destination: '/auth',
				permanent: false
			}
		}
	}

	return {
		props: { isConfigured }
	}
}

const Landing = (props) => {
	return (
		<Layout>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="flex justify-center py-2">
						<Logo />
					</div>
					<div className="text-center">
						<h1 className="text-2xl font-bold">Welcome!</h1>
					</div>

					<div className="">
						<Setup />
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Landing
