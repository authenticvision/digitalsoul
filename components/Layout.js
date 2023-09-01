import React, { ReactNode } from "react"

const Layout = (props) => (
	<div>
		<div className="bg-white dark:bg-slate-800 font-sans">
			{props.children}
		</div>
	</div>
)

export default Layout
