import { useState } from 'react'

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

const FileUploader = ({
	allowMultiple, endpoint, maxFiles, maxSize = '30MB', onFinish, disabled, ...props
}) => {
	const [assets, setAssets] = useState([])

	const afterProcess = () => {
		setAssets([])
		onFinish()
	}

	const onCloseModal = (e) => {
		setAssets([])
	}

	return (
		<div>
			<FilePond
				files={assets}
				onupdatefiles={setAssets}
				allowMultiple={allowMultiple}
				allowRevert={false}
				allowReorder={false}
				credits={false}
				maxFiles={maxFiles}
				disabled={disabled}
				maxFileSize={maxSize}
				onprocessfiles={afterProcess}
				server={endpoint}
				name="assets"
				labelIdle='Drag & Drop your NFT files or <span class="filepond--label-action">Browse</span>'
			/>
		</div>
	)
}

export default FileUploader
