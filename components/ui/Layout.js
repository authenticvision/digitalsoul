import React, { ReactNode } from "react"
import { NavBar } from '@/components/ui'

const Layout = (props) => (
	<div className="mx-auto h-screen flex flex-col bg-shark-950 text-white">
		<NavBar />

		<div className="w-full max-w-3xl mx-auto py-16">
			{props.children}
		</div>

		<footer className="py-10 w-full mt-auto border-t border-raven-700 flex items-center justify-center text-white bg-shark-950 z-20">
				<span className="text-white mr-1">Created by</span>
				<a
					href="https://authenticvision.com"
					aria-label="AuthenticVision Link"
					target="_blank"
					rel="noreferrer"
					className="text-white link link-hover"
				>
					AuthenticVision
				</a>
		</footer>
	</div>
)

export default Layout
