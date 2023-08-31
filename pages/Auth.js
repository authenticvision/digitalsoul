import React, { useState } from 'react'
import Image from 'next/image'
import Layout from '@/components/Layout'

const Auth = (props) => {
	return (
		<Layout>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					<div className="">
						<Image src="/logo-grey.svg" alt="logo" width="64" height="64" />
					</div>
					<div className="text-center">
						<h1 className="text-2xl font-bold">Auth!</h1>
					</div>

					<div className="">
					</div>
				</main>
			</div>
		</Layout>
	)
}

export default Auth
