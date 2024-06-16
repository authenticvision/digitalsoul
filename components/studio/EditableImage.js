import { Button } from "../ui"
import { PlusIcon, LinkIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import AssetAddModal from "./AssetAddModal"
import AssetLinkModal from "./AssetLinkModal"

import React, { useState, useEffect } from 'react'



const ImageCard = ({ asset, url, ...props }) => {
	return (
		<div className="relative group">
			<Image
				className="h-auto max-w-full rounded-lg"
				width={500}
				height={500}
				alt="NFT-Image"
				src={asset ? asset : url} />
		</div>
	)
}


const EditableImage = ({ 
  imgUrl,
  asset,
  contract,
  onLinkImage = undefined,
  onAddNewImage = undefined,
  onImageChanged = (assetType, asset) => {console.error("Neither onImageChanged handler or specific handler (onLinkImage, onAddImage) provided.")},
  ...props }) => {

  const [addImageModalVisible, setAddImageModalVisible] = useState(false);
  const [linkImageModalVisible, setLinkImageModalVisible] = useState(false);

  const onAssetAdded = (assetType, uploadedAsset) => {
    // Simple handler for future invoking
    if(onAddNewImage) {
      onAddNewImage(assetType, uploadedAsset);    
    } else {
      onImageChanged(assetType, uploadedAsset);
    }
  }

  const onAssetLinked = (assetType, linkedAsset) => {
    // Simple handler for future invoking
    if(onLinkImage) {
      onLinkImage(assetType, linkedAsset);    
    } else {
      onImageChanged(assetType, linkedAsset);
    }  
  }

  const closeAddImageModal = () => {
    setAddImageModalVisible(false);
  }

  const closeLinkImageModal = () => {
    setLinkImageModalVisible(false);
  }

  const handleAddImage = () => {
    setAddImageModalVisible(true);
  }

  const handleLinkImage = () => {
    setLinkImageModalVisible(true);
  }
	
	return (
    <div className="mt-2 flex flex-col items-center justify-center">
      <div className="relative">
        <ImageCard url={imgUrl} />
        {/* Icons overlay */}
        <div className="absolute top-0 right-0 flex space-x-2 p-2">
          <Button btnType="button" onClick={handleLinkImage} className="btn-circle glass">
              <LinkIcon className="h-6 w-6" />
          </Button>
          <Button btnType="button" onClick={handleAddImage} className="btn-circle glass">
              <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <AssetAddModal 
        open={addImageModalVisible} 
        allowChangingAssetType={false} 
        assetType={'image'}
        contract={contract} 
        onSubmit={onAssetAdded}
        onClose={closeAddImageModal} 
      />

      <AssetLinkModal 
        open={linkImageModalVisible} 
        allowChangingAssetType={false} 
        assetType={'image'}
        contract={contract} 
        onSubmit={onAssetLinked}
        onClose={closeLinkImageModal} 
      />
    </div>
	)
}

export default EditableImage
