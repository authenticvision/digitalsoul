import React, { useState } from "react"
import Router from "next/router"

const Setup = (props) =>  {
	const [apiKey, setApiKey] = useState("")

	const submitData = async(e) => {
		e.preventDefault()

		try {
			const body = { apiKey }
			await fetch('/api/setup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			console.log("Done!");
			await Router.push('/auth')
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div className="flex p-3 align-center justify-center">
			<form onSubmit={submitData}>
				<input className="w-full p-2 rounded my-2 text-black"
						autoFocus
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="API Key from AuthenticVision"
						type="text"
						value={apiKey} />

				<input type="submit"
					className="py-4 px-8 bg-slate-900 cursor-pointer w-full"
					disabled={!apiKey}
					value="Register" />
			</form>
		</div>
	)
}

export default Setup
