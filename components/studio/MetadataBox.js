import React, { useState, useEffect } from 'react'
import { pp } from '@/lib/utils'
import Link from 'next/link'

const MetadataBox = ({ nft, readOnly = false, onError = () => {}, ...props }) => {
	const [editing, setEditing] = useState(false)
	const [metadata, setMetadata] = useState(nft.metadata || {})
	const [renderedMetadata, setRenderedMetadata] = useState(pp(metadata))

	const metadataKeys = Object.keys(metadata)?.filter((key) => key != 'attributes')

	const onEdit = (e) => {
		if (Object.keys(metadata).length == 0) {
			setMetadata({
				name: nft.slid,
				description: "...",
				attributes: [{
				}]
			})
		}

		setEditing(true)
	}

	const onCancel = () => {
		setMetadata(nft.metadata || {})
		setEditing(false)
	}

	// XXX: Maybe this component shouldn't post anything and just send back
	// to the parent component what was changed. This adds a bit of complexity
	// since demand that the parent keep track of the metadata separately
	const save = async (parsedMetadata) => {
		try {
			const response = await fetch(`/api/internal/nft/${nft.anchor}/edit`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					metadata: parsedMetadata
				}),
			});

			const data = await response.json()

			setMetadata(data.metadata)
			setRenderedMetadata(pp(data.metadata))
			setEditing(false)
		} catch (error) {
			//onError('There was an error while trying to communicate with the API')
			console.error('Error: ', error);
		}
	}

	const onSave = async () => {
		try {
			let data = JSON.parse(renderedMetadata)
			save(data)
		} catch (error) {
			onError('JSON is invalid or cannot be parsed')
		}
	}

	const onChangeMetadata = (e) => {
		setRenderedMetadata(e.target.value)
	}

	useEffect(() => {
		setRenderedMetadata(pp(metadata))
	}, [metadata])

	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				Metadata
			</div>

			<div className="collapse-content relative">
				{editing ? (
					<div className="flex flex-col">
						<textarea value={renderedMetadata} onChange={onChangeMetadata} className="textarea textarea-bordered textarea-lg w-full max-w-xs" >
						</textarea>
						<div className="flex flex-row justify-between">
							<button onClick={onCancel} className="btn btn-link text-white text-center">
								Cancel
							</button>

							<button onClick={onSave} className="ml-2 btn btn-link text-white text-center">
								Save
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col">
						{metadataKeys.length > 0 && (
							<div className="grid grid-cols-3 grid-rows-1 gap-2">
								{metadataKeys.map((prop, index) => (
									<div key={prop} className="flex flex-col w-18 h-18 text-center rounded p-4">
										<span className="font-bold">{prop}</span>
										<span className="mt-2">{metadata[prop]}</span>
									</div>
								))}
							</div>
						)}

						{metadataKeys.length == 0 && (
							<div className="flex flex-col">
								<p className="w-full">
									This NFT has no metadata
								</p>
							</div>
						)}

						{!readOnly && (
							<button onClick={onEdit} className="btn btn-link text-white text-center">
								Edit
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default MetadataBox
