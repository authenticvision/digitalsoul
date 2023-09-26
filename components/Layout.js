import React, { ReactNode } from "react"

const Layout = (props) => (
	<div className="mx-auto h-screen flex flex-col">
		<div className="w-full max-w-3xl mx-auto py-16">
			{props.children}
		</div>

		<footer className="py-10 w-full mt-auto border-t flex items-center justify-center bg-accents-1 z-20">
				<span className="text-primary mr-1">Created by</span>
				<a
					href="https://authenticvision.com"
					aria-label="AuthenticVision Link"
					target="_blank"
					rel="noreferrer"
					className="text-black"
				>
					AuthenticVision
				</a>
		</footer>
	</div>
)

export default Layout
