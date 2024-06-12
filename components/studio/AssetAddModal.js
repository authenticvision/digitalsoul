import React, { useState, useEffect } from 'react'
import { Modal } from 'react-daisyui'
import { Button } from '../ui'
import FileUploader from './FileUploader'


const AssetAddModal = ({ contract, 
  allowChangingAssetType=true, 
  open, 
  assetType=undefined, 
  onClose = () => {console.error("NO onClose handler provided")}, 
  onSubmit = () => {console.error("NO onSubmit handler provided")},
  ...props }) => {

  const [newAssetType, setNewAssetType] = useState(assetType)

  const onFinishUpload = (files) => {
    const file = JSON.parse(files[0].serverId).asset
  
    //setNewAssetType('')
    onSubmit(newAssetType, file);
    onClose();
    
  }

  useState( () => {}, [newAssetType])

	return (
    <Modal.Legacy className="w-8/12 max-w-5xl" open={open} onClickBackdrop={onClose}>
      <form method="dialog">
       <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
      </form>
      <Modal.Header className="font-bold text-center">
        Upload asset <i><u>{newAssetType}</u></i>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 text-center">
          <div className="mb-4 text-center">
            <input type="text" value={newAssetType}
              onChange={(e) => setNewAssetType(e.target.value)}
              placeholder="Asset Type"
              hidden={!allowChangingAssetType}
              className="input input-bordered w-full max-w-xs" />
          </div>

          <FileUploader disabled={!newAssetType} endpoint={`/api/internal/contract/${contract.csn}/asset`}
            maxFiles={1} allowMultiple={false} onFinish={onFinishUpload}
          />
        </div>
      </Modal.Body>
    </Modal.Legacy>
	)
}

export default AssetAddModal
