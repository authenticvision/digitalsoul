import { useEffect, useState } from 'react';
import { Tooltip, Button } from '../ui';
import Toast from '@/components/studio/Toast'; // Ensure correct import path
import Link from 'next/link'
import { jsonify, generateAssetURL, jsonFromDaisyTheme } from '@/lib/utils';
import { EditableImage } from '@/components/studio'


const ContractSettings = ({ wallet, contract, ...props }) => {
  const [stateContract, setStateContract] = useState(contract);
  const [toast, setToast] = useState(null);

  const showToast = (message, duration, type) => {
    setToast(<Toast message={message} duration={duration} type={type} />);
    setTimeout(() => setToast(null), duration);
  };
  useEffect(() => {}, [toast]);


  const onFinish = (updatedContract) => {
    setStateContract(updatedContract);
    showToast("Changes saved successfully", 3000, "success"); // Adjusted to 3000ms (3 seconds)
  };

  const onError = (msg) => {
    showToast(msg, 5000, "error"); // Adjusted to 3000ms (3 seconds) and correct type
  };

  useEffect(() => {}, [stateContract]);

  // Form variables
  const [nftName, setNftName] = useState(contract.settings?.NFT_NAME);
  const [nftDescription, setNftDescription] = useState(contract.settings?.NFT_DESCRIPTION);
  const [autoClaim, setAutoClaim] = useState(contract.settings?.AUTO_CLAIM);
  const [theme, setTheme] = useState(JSON.stringify(jsonify(contract.design?.theme || {}), undefined, 2));
  const [newLogo, setNewLogo] = useState(null)

  const variableText = "Use [VARIABLE] to insert dynamic content. Supported variables: ANCHOR, ANCHOR_SHORT, CONTRACT_ADDRESS, COLLECTION_NAME, COLLECTION_NAME_SHORT"

  const handleSave = async () => {   

    let data = {
        contractSettings: {
        NFT_NAME: nftName,
        NFT_DESCRIPTION: nftDescription,
        AUTO_CLAIM: autoClaim,
      },
      theme: theme,
      logo: newLogo // only stored when newLogo != null
    }

    save(data)    
  }



  const save = async (newSettings) => {
    try {
      const response = await fetch(`/api/internal/contract/${stateContract.csn}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (response.ok) {
        onFinish(data);
      } else {
        let errorMsg = data.message;
        if (data.issues) {
          errorMsg = `${errorMsg} ${data.issues}`;
        }

        onError(errorMsg);
      }
    } catch (error) {
      console.error('Error: ', error);
      onError('There was an error while trying to communicate with the API');
    }
  };

  const getLogoUrl = () => {
    // Prio 1: New Logo
    if(newLogo) {
      return generateAssetURL(contract.csn, newLogo.assetHash);
    }

		// Priority 2: The primary asset-URL as queried from the NFT
    const assetHash = contract.design?.logo?.assetHash;
		if(assetHash) {
			return generateAssetURL(contract.csn, assetHash);
		}
		
		// Priority 3: Fallback / empty
		return '/nft-fallback-cover.webp'
	}

  const handleThemePaste = (e) => {
    // Prevent the default paste action
    e.preventDefault();

    // Get the pasted content from the clipboard
    const clipboardContent = e.clipboardData.getData('text');

    // Pass the clipboard content through myFunction
    const modifiedContent = jsonFromDaisyTheme(clipboardContent);

    if(modifiedContent) {
      console.log("Parsed JSON (evtl. converted from DaisyUI-Theme generator)")
      setTheme(JSON.stringify(modifiedContent, undefined, 2));
    } else {
      // if it was not parseable, set it anyway to avoid user-confusion
      setTheme(e.clipboardData.getData('text'));
    }
  };

  const logoChanged = (assetType, asset) => {
    setNewLogo(asset)
  }

  return (
    <div>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <label className="label">
                    <span className="label-text">NFT-Name</span>
                  < Tooltip text={`Added as 'name' to NFT metadata. ${variableText}`}><p>(?)</p></Tooltip>
                  </label>
                </td>
                <td>
                  <input type="text" value={nftName}
                    className="input input-bordered w-full"
                    onChange={(e) => setNftName(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label">
                    <span className="label-text">NFT-Description</span>
                    <Tooltip text={`Added as 'descripton' to NFT metadata. ${variableText}`}><p>(?)</p></Tooltip>
                  </label>
                </td>
                <td>
                <input type="text" value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  className="input input-bordered w-full" />
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label">
                    <span className="label-text">NFT Auto-Transfer</span>
                    <Tooltip text={`After a successful scan; When a valid beneficiary (wallet or email) is available and it is not the current owner, the NFT is automatically transferred to this beneficiary wallet.`}>
                      <p>(?)</p>
                    </Tooltip>
                  </label>
                </td>
                <td>
                  <select
                    className="input input-bordered w-full"
                    value={autoClaim ? 'yes' : 'no'}
                    onChange={(e) => setAutoClaim(e.target.value === 'yes')}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
              </tr>              
              <tr>
                <td>
                  <label className="label">
                    <span className="label-text">Logo</span>
                    <Tooltip text={`The Logo is displayed at the top of your collection page, which is shown to the user after a successful scan.`}>
                      <p>(?)</p>
                    </Tooltip>
                  </label>
                </td>
                <td>
                <EditableImage
                  contract={contract}
                  imgUrl={getLogoUrl()}
                  onImageChanged={logoChanged}
                />
                </td>
              </tr>
              <tr>
                <td>
                  <label className="label">
                    <span className="label-text">Theme colors (<Link className="link" target="blank" href="https://daisyui.com/theme-generator/">Theme generator</Link>)</span>
                    <Tooltip text={`The collection pages use DaisyUI components. Use their theme color names to style your collection page.`}>
                      <p>(?)</p>
                    </Tooltip>
                  </label>
                </td>
                <td>
                <textarea
                  className="textarea textarea-bordered flex w-full h-48"
                  onChange={(e) => setTheme(e.target.value)}
                  onPaste={handleThemePaste}
                  value={theme}
                />
                </td>
              </tr>
            </tbody>
          </table>
          <Button text="Save" onClick={handleSave}
                  className="btn btn-primary mt-5 text-center" /> 
        </div>
        {toast}
    </div>
  );
};

export default ContractSettings;
