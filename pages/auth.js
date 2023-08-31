import React, { useState } from 'react'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Logo from '@/components/Logo'

const Auth = (props) => {
	return (
		<Layout>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col justify-center align-center">
					<div className="flex justify-center py-2">
						<Logo />
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
