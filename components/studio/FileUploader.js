import { useState, useRef } from 'react'

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
	const pondRef = useRef(null)

	const afterProcessFiles = () => {
		const processedFiles = pondRef.current.getFiles()

		// XXX: This utter garbage is due to the fact that assets is never ready
		// after processing the list of files. You can verify by logging the
		// assets array here. It'll always be empty, even if we wrap this into
		// a useCallback
		setAssets([])
		onFinish(processedFiles)
	}

	const onCloseModal = (e) => {
		setAssets([])
	}

	return (
		<div>
			<FilePond
				files={assets}
				onupdatefiles={setAssets}
				ref={pondRef}
				allowMultiple={allowMultiple}
				allowRevert={false}
				allowReorder={false}
				credits={false}
				maxFiles={maxFiles}
				disabled={disabled}
				maxFileSize={maxSize}
				onprocessfiles={afterProcessFiles}
				server={endpoint}
				name="assets"
				labelIdle='Drag & Drop your NFT files or <span className="filepond--label-action">Browse</span>'
			/>
		</div>
	)
}

export default FileUploader
