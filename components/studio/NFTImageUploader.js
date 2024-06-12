import React, { useState } from 'react'

import { Button } from '@/components/ui'

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

const NFTImageUploader = ({ nft, onFinish, ...props }) => {
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
					maxFiles={1}
					maxFileSize={'30MB'}
					onprocessfiles={afterProcess}
					server={`/api/internal/assets/${nft.contract.csn}/${nft.anchor}/image`}
					name="assets"
					labelIdle='Drag & Drop your images (jpg, png, gif) or <span className="filepond--label-action">Browse</span>'
				/>
			</div>

			<div className="modal-action">
				<form method="dialog">
					<Button text="Cancel" onClick={onCloseModal} className="btn" />
				</form>
			</div>
		</div>
	)
}

export default NFTImageUploader
