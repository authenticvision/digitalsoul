import { useState } from 'react';
import { Button, Tooltip, Alert } from '../ui';

const EditableContractSettings = ({ wallet, contract, ...props }) => {
  const [nftName, setNftName] = useState(contract.settings?.NFT_NAME);
  const [nftDescription, setNftDescription] = useState(contract.settings?.NFT_DESCRIPTION);
  const [success, setSuccess] = useState();
  const [error, setError] = useState()

  const variableText = "Use [VARIABLE] to insert dynamic content. Supported variables: ANCHOR, ANCHOR_SHORT, CONTRACT_ADDRESS, COLLECTION_NAME, COLLECTION_NAME_SHORT"

  const onFinish = () => {
    setSuccess("Changes saved successfully");
    setTimeout(() => setSuccess(), 1500); // Hide alert after 3 second
  }

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
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">NFT-Name</span>
          <Tooltip text={`Added as 'name' to NFT metadata. ${variableText}`}><p>(?)</p></Tooltip>
        </label>
        <input type="text" value={nftName}
          className="input input-bordered w-full"
          onChange={(e) => setNftName(e.target.value)}
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">NFT-Description</span>
          <Tooltip text={`Added as 'descripton' to NFT metadata. ${variableText}`}><p>(?)</p></Tooltip>
        </label>
        <input type="text" value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          className="input input-bordered w-full" />
      </div>

      <Button text="Save" onClick={onSave}
              className="ml-2 btn btn-link text-white text-center" /> 
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
