// EditableContractSettings.js
import { useState, useEffect } from 'react';
import { Button, Alert } from '../ui';

const EditableContractSettings = ({ wallet, contract, ...props }) => {
  const [nftName, setNftName] = useState(contract.settings?.NFT_NAME);
  const [nftDescription, setNftDescription] = useState(contract.settings?.NFT_DESCRIPTION);
  const [success, setSuccess] = useState();
  const [error, setError] = useState()

  const onFinish = () => {
    setSuccess("Changes saved successfully");
    setTimeout(() => setSuccess(), 1500); // Hide alert after 3 second
  }

  {error && (
    <div className="mt-5">
      <Alert text={error} type='error' />
    </div>
  )}

  const save = async (newSettings) => {
    try {
      const response = await fetch(`/api/internal/contract/${contract.csn}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractSettings: newSettings
        }),
      });

      const data = await response.json()

      if (response.ok) {
        setError()
        onFinish()
      } else {
        let errorMsg = data.message

        if (data.issues) {
          errorMsg = `${errorMsg} ${data.issues}`
        }

        setError(errorMsg)
      }
    } catch (error) {
      console.error('Error: ', error);
      setError('There was an error while trying to communicate with the API')
    }
  }

  const onSave = async () => {
    try {
      let data = {
        NFT_NAME: nftName,
        NFT_DESCRIPTION: nftDescription
      }

      save(data)
    } catch (error) {
      setError('Unknown error')
    }
  }

  return (

    <div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">NFT Name Name</span>
        </label>
        <input type="text" value={nftName}
          className="input input-bordered w-full max-w-xs"
          onChange={(e) => setNftName(e.target.value)}
        />
      </div>

      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">NFT Description</span>
        </label>
        <input type="text" value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          className="input input-bordered w-full max-w-xs" />
      </div>

      <button onClick={onSave} className="ml-2 btn btn-link text-white text-center">
        Save
      </button>
      {error && (
				<div className="mt-5">
					<Alert text={error} type='success' />
				</div>
			)}

      {success && (
				<div className="mt-5">
					<Alert text={success} type='success' />
				</div>
			)}
    </div>
  );
}

export default EditableContractSettings
