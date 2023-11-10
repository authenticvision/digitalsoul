import React, { useState } from 'react'
import { pp } from '@/lib/utils'
import Link from 'next/link'

const MetadataBox = ({ nft, readOnly = false, ...props }) => {
	const [editing, setEditing] = useState(false)
	const [metadata, setMetadata] = useState(nft.metadata || {})

	const metadataKeys = Object.keys(metadata)

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

	const onSave = async () => {
	}


	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				Metadata
			</div>

			<div className="collapse-content relative">
				{editing ? (
					<div className="flex flex-col">
						<textarea defaultValue={pp(metadata)} className="textarea textarea-bordered textarea-lg w-full max-w-xs" >
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
					<>
						{metadataKeys.length > 0 && (
							<div className="grid grid-cols-3 grid-rows-3 gap-2 pb-4">
								{metadataKeys.map((prop, index) => (
									<div key={prop} className="flex flex-col w-18 h-18 text-center rounded p-4">
										<span>{prop}</span>
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

								{!readOnly && (
									<button onClick={onEdit} className="btn btn-link text-white text-center">
										Edit
									</button>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default MetadataBox
