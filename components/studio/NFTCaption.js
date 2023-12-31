import React, { useState } from 'react'
import { formatAddress, generateMetaDataURL } from '@/lib/utils'
import { Button } from "@/components/ui"

const Overlay = ({ jsonData, link, onClose }) => {
	const formattedJson = JSON.stringify(jsonData, null, 2)

	return (
		<div className="modal modal-open">
			<div className="modal-box justify-start text-left">
				<h3 className="font-bold text-lg">Public Metadata</h3>
				<h3 className="font-bold text-lg">{link}</h3>
				<pre className="text-xs">{formattedJson}</pre>
				<div className="modal-action">
					<Button onClick={onClose} className="btn" text="Close" />
				</div>
			</div>
		</div>
	)
}

const NFTCaption = ({ nft, staticCaption, ...props }) => {
	staticCaption = nft.anchor == 'default' ? 'DEFAULT-NFT' : staticCaption

	const [showOverlay, setShowOverlay] = useState(false)
	const [jsonData, setJsonData] = useState(null)

	const handleOpenOverlay = async (url) => {
		try {
			const response = await fetch(url)
			const data = await response.json()
			setJsonData(data)
			setShowOverlay(true)
		} catch (error) {
			console.error('Error fetching JSON data:', error)
		}
	}

	const metadataPreviewLink = generateMetaDataURL(nft)

	const onClickJSON = (e, metadataPreviewLink) => {
		e.stopPropagation()
		handleOpenOverlay(metadataPreviewLink)
	}


	return (
		<div className="flex flex-row items-end justify-between">
			{staticCaption ? (
				<div className="font-bold text-lg">{staticCaption}</div>
			) : (
				<div className="flex flex-col text-left">
					<div className="w-full text-gray-400 text-xs">
						<p>{formatAddress(nft.anchor, 22)}
							<Button
								className="ml-1 text-white"
								onClick={(e) => onClickJSON(e, metadataPreviewLink)}
								variant="btn-link"
								text="(JSON)"
							/>
						</p>
					</div>
					<div className="font-bold text-lg">{nft.slid}</div>
				</div>
			)}

			{showOverlay && (
				<Overlay jsonData={jsonData} onClose={() => setShowOverlay(false)} />
			)}
		</div>
	)
}

export default NFTCaption
