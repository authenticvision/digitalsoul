import React, { useState, useEffect } from "react"
import Router from "next/router"
import Button from "@/components/Button"
import { useSignMessage, useAccount } from 'wagmi'
import { recoverMessageAddress } from 'viem'

const Setup = ({ signMessageText, onDone, ...props }) =>  {
	const [error, setError] = useState()
	const { address } = useAccount()
	const { data: signMessageData, error: signError, isLoading, signMessage, variables } =
		useSignMessage()

	const completeSetup = async({ signMessageData, recoveredAddress }) => {
		try {
			const response = await fetch('/api/internal/setup', {
				method: "POST", // or 'PUT'
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					signedMessage: signMessageData,
					address
				}),
			});

			if (response.status == 201) {
				Router.push('/')
			} else {
				const responseData = await response.json()
				setError(responseData.error)
			}

		} catch (error) {
			setError("There was an error while trying to communicate with the API")
			console.error("Error:", error);
		}
	}

	useEffect(() => {
		;(async () => {
			if (variables?.message && signMessageData) {
				const recoveredAddress = await recoverMessageAddress({
					message: variables?.message,
					signature: signMessageData,
				})

				const response = await completeSetup({
					signMessageData,
					recoveredAddress
				})
			}
		})()
	}, [signMessageData, variables?.message])

	// Use the useState and useEffect hooks to track whether the component has
	// mounted or not
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);

	// If the component has not mounted yet, return null
	if (!hasMounted) {
		return null;
	}

	return (
		<div className="flex flex-col p-3 align-center justify-center">
			<p>
				In order to establish communication with MetaAnchor servers
				and validate your DevKit we'll require you to Sign this Message
			</p>


			<p className="block mt-5">
				{error}
			</p>

			<div className="flex flex-col text-center">
				<Button disabled={isLoading}
						onClick={() => signMessage({ message: signMessageText })}
						text={isLoading ? 'Loading...' : 'Sign Message'} />
			</div>
		</div>
	)
}

export default Setup
