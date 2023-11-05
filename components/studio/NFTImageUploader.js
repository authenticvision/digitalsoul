import React, { useState } from 'react'

import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

registerPlugin(
	FilePondPluginImageExifOrientation,
	FilePondPluginFileValidateSize,
	FilePondPluginImagePreview
)

const NFTImageUploader = ({ anchor, onFinish, ...props }) => {
	const [assets, setAssets] = useState([])

	const afterProcess = () => {
		setAssets([])
		onFinish()
	}

	const onCloseModal = (e) => {
		setAssets([])
	}

	return (
		<div className="modal-box">
			<div>
				<FilePond
					files={assets}
					onupdatefiles={setAssets}
					allowMultiple={true}
					allowRevert={false}
					allowReorder={false}
					credits={false}
					maxFiles={3}
					maxFileSize={'3MB'}
					onprocessfiles={afterProcess}
					server={`/api/internal/assets/${anchor}`}
					name="assets"
					labelIdle='Drag & Drop your NFT files or <span class="filepond--label-action">Browse</span>'
				/>
			</div>

			<div className="modal-action">
				<form method="dialog">
					<button onClick={onCloseModal} className="btn">Cancel</button>
				</form>
			</div>
		</div>
	)
}

export default NFTImageUploader
