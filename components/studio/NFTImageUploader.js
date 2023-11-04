import React, { useState } from 'react'

import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

const NFTImageUploader = ({ anchor, onFinish, ...props }) => {
	const [assets, setAssets] = useState([])

	return (
		<div className="modal-box">
			<div>
				<FilePond
					files={assets}
					onupdatefiles={setAssets}
					allowMultiple={true}
					maxFiles={3}
					onprocessfiles={onFinish}
					server={`/api/internal/assets/${anchor}`}
					name="assets"
					labelIdle='Drag & Drop your NFT files or <span class="filepond--label-action">Browse</span>'
				/>
			</div>

			<div className="modal-action">
				<form method="dialog">
					<button className="btn">Cancel</button>
				</form>
			</div>
		</div>
	)
}

export default NFTImageUploader
