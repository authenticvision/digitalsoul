import React, { useState, useEffect } from 'react'
import { pp, cn } from '@/lib/utils'
import Link from 'next/link'

const MetadataBox = ({ nft, readOnly = false, onFinish = () => {}, onError = () => {}, ...props }) => {
	const [editing, setEditing] = useState(false)
	const [metadata, setMetadata] = useState(nft.metadata || {})
	const [error, setError] = useState()
	const [renderedMetadata, setRenderedMetadata] = useState(pp(metadata))

	const metadataKeys = Object.keys(metadata)?.filter((key) => key != 'attributes')

	const onEdit = (e) => {
		if (Object.keys(metadata).length == 0) {
			setMetadata({
				attributes: [{"trait_type": "My Trait", "value": "is awesome" }]
			})
		}

		setError()
		setEditing(true)
	}

	const onCancel = () => {
		setError()
		setMetadata(nft.metadata || {})
		setEditing(false)
	}

	const save = async (parsedMetadata) => {
		try {
			const response = await fetch(`/api/internal/nft/${nft.contract.csn}/${nft.anchor}/edit`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					metadata: parsedMetadata
				}),
			});

			const data = await response.json()

			if (response.ok) {
				setMetadata(data.metadata)
				setRenderedMetadata(pp(data.metadata))
				setEditing(false)
				setError()
				onFinish()
			} else {
				let errorMsg = data.message

				if (data.issues) {
					errorMsg = `${errorMsg} ${data.issues}`
				}

				setError(errorMsg)
			}
		} catch (error) {
			setError('There was an error while trying to communicate with the API')
			console.error('Error: ', error);
		}
	}

	const onSave = async () => {
		try {
			let data = JSON.parse(renderedMetadata)
			save(data)
		} catch (error) {
			setError('JSON is invalid or cannot be parsed')
		}
	}

	const onChangeMetadata = (e) => {
		setError()
		setRenderedMetadata(e.target.value)
	}

	useEffect(() => {
		setError()
		setRenderedMetadata(pp(metadata))
	}, [metadata])

	const textAreaClassNames = cn(
		`textarea textarea-bordered textarea-lg w-full max-w-m text-xs`,
		error ? 'textarea-error' : ''
	)

	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				Metadata
			</div>

			<div className="collapse-content relative">
				{editing ? (
					<div className="flex flex-col">
						<div className="form-control">
							<textarea value={renderedMetadata} onChange={onChangeMetadata} className={textAreaClassNames} cols="100" rows="15">
							</textarea>
							<label className="label">
								<span className="label-text-alt text-error">{error}</span>
							</label>
							<p>Refer <Link className = "link" href="https://docs.opensea.io/docs/metadata-standards" target="blank">OpenSea MetaData Standard</Link></p>
						</div>

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
									This NFT has no additional metadata (attributes/traits below)
								</p>
							</div>
						)}

						{!readOnly && (
							<button onClick={onEdit} className="btn btn-link text-white text-center">
								Edit Attributes and Metadata
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default MetadataBox
