import React, { useCallback, useState, useEffect } from "react"
import NextHead from 'next/head.js'

import fs from 'fs';
import path from 'path';

import { Layout, Button, Alert } from '@/components/ui'

export async function getServerSideProps(context) {

	// this tests accessing the filesystem w/o exposing it to client-side
	// FIXME THIS FILE WILL BE REMOVED ALLTOGETHER, JUST FOR INFRA-TESTING
	const dirPath = path.join(process.cwd(), '/nftdata'); // FIXME HARDCODED

    // Read the contents of the directory
    let files;
    try {
        files = fs.readdirSync(dirPath);
    } catch (err) {
        console.error("Error reading the directory", err);
        files = []; // or handle the error appropriately
    }

    // Return the list of files as props
    return { props: { files } };
}

const FSDemo = (props) => {
	const [error, setError] = useState()

	// Use the useState and useEffect hooks to track whether the component has
	// mounted or not
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
				<title>TO BE REMOVED</title>
			</NextHead>
			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
					{error && (
						<Alert type='error' text={error} />
					)}
					FIXME THIS FILE WILL BE REMOVED ALLTOGETHER, JUST FOR INFRA-TESTING
					<br /><br />

                    /srv/app/nftdata
                    <ul>
						{props.files.map((file, index) => (
						<li key={index}>&nbsp;|___{file}</li>
						))}
					</ul>
				</main>
			</div>
		</Layout>
	)
}

export default FSDemo
