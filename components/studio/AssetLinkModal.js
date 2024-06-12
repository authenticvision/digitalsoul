import React, { useState, useEffect } from 'react'
import { Modal } from 'react-daisyui'
import { Button, SelectableCardList } from '../ui'
import { useAssets } from '@/hooks'


const AssetLinkModal = ({ contract, 
  allowChangingAssetType=true, 
  open, 
  assetType=undefined, 
  onClose = () => {console.error("NO onClose handler provided")}, 
  onSubmit = () => {console.error("NO onSubmit handler provided")},
  ...props }) => {

  const [newAssetType, setNewAssetType] = useState(assetType)
  const [newAsset, setNewAsset] = useState(null)

  const onFinishUpload = () => {   
    onSubmit(newAssetType, newAsset);
    onClose();    
  }

  const onSelectAsset = (asset) => {
		setNewAsset(asset)
	}

  const { assets, isLoading: isLoadingAssets, error: errorAssets } = useAssets(
    contract.csn
  )

  useState( () => {}, [newAssetType])

	return (
    <Modal.Legacy className="w-8/12 max-w-5xl" open={open} onClickBackdrop={onClose}>
      <form method="dialog">
       <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
      </form>
      <Modal.Header className="font-bold text-center">
        Link asset <i><u>{newAssetType}</u></i>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 text-center">
          <input type="text" value={newAssetType}
            onChange={(e) => setNewAssetType(e.target.value)}
            placeholder="Asset Type"
            hidden={!allowChangingAssetType}
            className="input input-bordered w-full max-w-xs" />
        </div>

        <div>
          <SelectableCardList onSelect={onSelectAsset}
            disabled={!newAssetType}
            items={assets} />
        </div>
      </Modal.Body>
      <Modal.Actions>
        <div className="flex flex-row justify-between w-full">
          <div></div>
          <Button onClick={onFinishUpload} btnType='button' disabled={!newAssetType}>Save</Button>
        </div>
      </Modal.Actions>
    </Modal.Legacy>
	)
}

export default AssetLinkModal
