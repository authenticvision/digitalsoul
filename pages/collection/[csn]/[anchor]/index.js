import React, { useState, useEffect, useRef } from 'react'
import NextHead from 'next/head'
import Image from 'next/image'
import { Alert, Logo } from '@/components/ui'
import { StyledCollectionLayout, NftDetails, NftVisualization, NftOwnership, AuthorizationBar, Modal } from '@/components/collection'
import { beneficiaryToWallet, generateThemeURL, generateMetaDataURL, generateNftLandingOptionURL, jsonify, verifyBeneficiary } from '@/lib/utils'
import { decodeAttestation } from '@/lib/serverUtils'
import prisma from '@/lib/prisma'
import MetaAnchor from '@/lib/api.metaanchor.io'
import receivingNFTAnimation from "@/lib/receivingNFT.json";
import Lottie from "lottie-react";
import { generateDaisyColors } from '@/lib/themeColors'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'


export async function getServerSideProps(context) {
	const { csn, anchor } = context.query;
  const {av_beneficiary, av_attestation} = context.query;
  let themeConfig = {}

  function makeErrorProps(errorMsg) {
    return {props: {serverError: errorMsg, themeConfig:themeConfig}}
  }

  const attestation = av_attestation ? await decodeAttestation(av_attestation) : null;

  const nftStr = `${csn}/${anchor}`;
  let metadata = null;
  let assetData = null; // on-chain data
  let landingOptions = null;
  const beneficiary = av_beneficiary?.toString() || null;

  // TODO Resolve wallet.
  const wallet = {
    id: beneficiary,
    wallet_type: "EOA",
    address: beneficiary,
  }

  const config = await prisma.config.findFirst()
	const metaAnchorApiURL = process.env.METAANCHOR_API_URL

	const api = new MetaAnchor({
		baseUrl: metaAnchorApiURL,
		apiKey: config.apiKey
	})

  const dbNft = await prisma.NFT.findFirst({
    where: {
      anchor: anchor,
      contract: {
        csn: {
          equals: csn,
					mode: "insensitive"
        }
      },
    },
    include: {
      contract: true,
      assets: true
    }
  })

  if (!dbNft) {
    return makeErrorProps(`${nftStr} not found`)
  }

  // if NFT is found, we can also assume that this NFT is managed by our ds_instance. 
  // we take the risk and just query the API w/o checking if we actually manage the NFTs
  // will be undefined/null if not available
  assetData = (await api.getAssetData(anchor))?.data

  // Get information
  const dataToFetch = [
    {url: generateNftLandingOptionURL(dbNft), setData: (data) => {landingOptions = data}},
    {url: generateThemeURL(dbNft), setData: (data) => {
      themeConfig = data; 
    }},
    // This fetches EITHER the on-chain token-uri (if available and non-empty), or generates the local URI. 
    // In almost all cases, the tokenURI will just be the same as generateMetaDataURL, but there may be instances, 
    // where smart-contracts have a different tokenURI on purpose. We want to resemble the on-chain status
    // as closes as  possible
    // Note NFT-Data must be fetched last, as it may create errors, which we want to present according to contract options
    {url: assetData.token_uri ? assetData.token_uri : generateMetaDataURL(dbNft), setData: (data) => {metadata = data}},
  ]

  for (const toFetch of dataToFetch) {
    try {
      const url = new URL(toFetch.url, process.env.NEXTAUTH_URL).toString()
      const response = await fetch(url);
      const status = response.status;
      if (status != 200) {
        return makeErrorProps("NFT is undefined. Contact collection owner.");
      }
      const toStore = await response.json();
      toFetch.setData(toStore);
    } catch (error) {
      console.error(`Error fetching NFT-related data from ${toFetch.url}`, error);
      return makeErrorProps(`Anchor ${csn.toUpperCase()}/${anchor} undefined`)
    }
  }

	return {
		props: {
      metadata: metadata,
      anchor: anchor,
      avBeneficiary: beneficiary,
      landingOptions: landingOptions,
      themeConfig: themeConfig,
      serverError: null,
      assetData: assetData,
      attestation: JSON.stringify(attestation),
      wallet: wallet,
		}
	}
}

const CollectionItemView = ({ wallet, metadata, avBeneficiary, themeConfig, attestation, assetData, landingOptions, serverError, ...props }) => {
  const claimInProgressModal = useRef(null)
  const nftTransferredModal = useRef(null)
  const changeWalletModal = useRef(null)

  const [error, setError] = useState(serverError)
  const [beneficiary, setBeneficiary] = useState(avBeneficiary);
  const [secondsToExpire, setSecondsToExpire] = useState(null)
  const [attestationValid, setAttestationValid] = useState(null)
  const [claimInProgress, setClaimInProgress] = useState(false);
  const [nftLost, setNftLost] = useState(false);
  const [ownershipDetails, setOwnershipDetails] = useState(null)
  const [updatedBeneficiary, setUpdatedBeneficiary] = useState(beneficiary);
  const [stateWallet, setStateWallet] = useState(wallet)
  const [updatedBeneficiaryIsValid, setUpdatedBeneficiaryIsValid] = useState(false);
  const [autoClaimPossible, setAutoClaimPossible] = useState(landingOptions?.auto_claim || false)
  const [theme, setTheme] = useState(themeConfig);
  const attestationToken = jsonify(attestation)?.token || null;
  const attestationPayload = jsonify(attestation)?.payload || null;
  const [doChangeWallet, setDoChangeWallet] = useState(false);
  const [doClaimWhenComplete, setDoClaimWhenComplete] = useState(false);

  const logoSrc = landingOptions?.logo ? landingOptions.logo : "/logo-white.svg";

  useEffect( () => {
    if(doClaimWhenComplete) {
      setDoClaimWhenComplete(false); // reset!
      handleClaim();
    }
  }, [beneficiary, attestationToken, doClaimWhenComplete])

  const verifyAttestation = async () => {
    if(!(attestationToken && beneficiary)) {
      console.log(`Not verifying, either attestation token or beneficiary missing. Beneficiary: ${beneficiary}, attestation: ${attestationToken}`)
      return;
    }

    const response = await fetch('/api/internal/landing/verify', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avAttestation:attestationToken,
        walletAddress: beneficiary
      })
    })

    // FIXME error handling!
    const jResponse = await response.json()
    return jResponse
  }

  useEffect( () => {
    // FIXME Proper resolving? 
    // Maybe via verify?
    setStateWallet(beneficiaryToWallet(beneficiary))
  }, [beneficiary])

  useEffect( () => {
  }, [stateWallet])

  const handleWalletChange = () => {
    setDoChangeWallet(true);
  }

  const onWalletChangeClose = () => {
    setDoChangeWallet(false);
  }

  const onTransferredClose = () => {
    setNftLost(false);
  }

  const onWalletInputChange = (e) => {
    const value = e.target.value;
    setUpdatedBeneficiary(value)
    setUpdatedBeneficiaryIsValid(verifyBeneficiary(value));
  }

  const onWalletInputChangeCommit = () => {
    console.log(`Updating beneficiary ${beneficiary} -> ${updatedBeneficiary}`)
    setBeneficiary(updatedBeneficiary);
  }

  const handleNftLost = () => {
    console.log("NFT transferred from my wallet")
    setNftLost(true);
  }

  const getCurrentOwner = () => {
    return ownershipDetails?.asset?.owner || assetData?.owner
  }

  const handleClaim = async () => {
    if(!attestationValid) {
      setError("Attestation is no longer valid. Scan again!");
      return;
    }

    if(claimInProgress) {
      console.warn("Claim already in progress")
      return;
    }

    if(!verifyBeneficiary(beneficiary)) {
      setDoClaimWhenComplete(true);
      handleWalletChange();
      return;
    }

    try {
      setClaimInProgress(true);
      const response = await fetch('/api/internal/landing/claim', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avAttestation:attestationToken,
          beneficiary: beneficiary
        })
      })
  
      if (response.ok) {
        console.log('CLAIM successful');
        setClaimInProgress(false);
      } else {
        console.error('CLAIM failed');
        setError('CLAIM failed, please try again');
      }

    } catch (error) {
      console.error('Error:', error);
      setError('Error occurred');
      
    } finally {
      setTimeout(() => {
        setClaimInProgress(false);
      }, 10000);
    }
  };


  useEffect( () => {
    if(claimInProgress) {
      claimInProgressModal.current?.showModal();
    } else {
      claimInProgressModal.current?.close();
    }
  }, [claimInProgress])

  useEffect( () => {
    if(nftLost) {
      nftTransferredModal.current?.showModal();
    } else {
      nftTransferredModal.current?.close();
    }
    // FIXME reset variable?
  }, [nftLost])

  useEffect( () => {
    if(doChangeWallet) {
      changeWalletModal.current?.showModal();
    } else {
      changeWalletModal.current?.close();
    }
  }, [doChangeWallet])

  
  function getSecondsToExpire() {
    if(!attestationPayload) { 
      return -1;
    }

    const expiryDate = new Date(attestationPayload.exp).getTime()
    const now = new Date().getTime();
    const seconds = Math.floor((expiryDate - now)/ 1000.0)
    return seconds
  }

  useEffect(() => {
    if (theme) {
      const allColors = generateDaisyColors(theme);
      // Apply the theme to the root element
      Object.keys(allColors).forEach(key => {
        // This is supported syntax by the oklch function built into browsers!
        document.documentElement.style.setProperty(`--${key}`, allColors[key]);
      });
    }
  }, [theme]);

  useEffect(() => {
    // Set the initial value on client side
    setSecondsToExpire(getSecondsToExpire());
    // Update every second
    const interval = setInterval(() => {
      const seconds = getSecondsToExpire()
      setSecondsToExpire(seconds);
      const isValid = seconds > 0.0;
      setAttestationValid(isValid);
      // TODO deactivate the interval... tokens will never become active agaiion
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsToExpire]);


  useEffect(() => {
    // Set the initial value on client side
    setSecondsToExpire(getSecondsToExpire());
    // Update every second
    const interval = setInterval( async () => {
      const isOwnerBefore = ownershipDetails?.wallet_is_owner;

      const ownerWalletBefore = ownershipDetails?.asset?.owner
      const assetOwnershipInfo = await verifyAttestation();
      setOwnershipDetails(assetOwnershipInfo);
      if(ownershipDetails?.wallet) {
        setStateWallet(ownershipDetails?.wallet);
      }
      if(isOwnerBefore && !assetOwnershipInfo?.wallet_is_owner) {
        if(ownerWalletBefore != assetOwnershipInfo?.asset?.owner) {
          handleNftLost();
        } else {
          console.log("Current wallet is no longer the owner, but no NFT transfer occurred. Likely wallet changed?")
        }
      }
      
      if(autoClaimPossible) {
        if(!assetOwnershipInfo?.wallet_is_owner) {
          if(verifyBeneficiary(beneficiary) && attestationValid) {
            console.log(`Initiate Auto-Claim for ${beneficiary}`)
            setAutoClaimPossible(false);
            handleClaim();
          }
        }
      }
      

    }, 1000);
    return () => clearInterval(interval);
  }, [ownershipDetails, beneficiary]);

	return (
		<StyledCollectionLayout>
			<NextHead>
				<title>{metadata?.name}</title>
			</NextHead>

			<div className="page container w-full py-5 px-2 my-0 mx-auto">
				<main className="flex flex-col">
          <div className="flex justify-center py-2">
						{error && (
							<Alert type='error' text={error} />
						)}
					</div>

					{!error && (
            <div>
              <AuthorizationBar wallet={stateWallet} handleWalletChange={handleWalletChange} />
              <div className="flex justify-center align-center w-full">
                <img src={logoSrc} fill className="priority" width={200} alt="Collection Logo" />
						  </div>
              <div className="mt-10">
                <NftVisualization metaData={metadata} isOwned={ownershipDetails?.wallet_is_owner || false} />
              </div>

              <div className="mt-5">
                <NftOwnership 
                  currentOwner={getCurrentOwner()}
                  isOwned={ownershipDetails?.wallet_is_owner || false}
                  onClaim={handleClaim}
                  attestationValid={attestationValid}
                  secondsToExpire={secondsToExpire}
                />
              </div>

              <div className="mt-5">
                <NftDetails assetData={assetData}/>
              </div>
              <Modal refObj={claimInProgressModal} hideSubmit={true}>
                <div className="w-full p-2 mt-5">
                  <Lottie animationData={receivingNFTAnimation} />
                </div>
                <div>
                  {getCurrentOwner()} to {beneficiary}
                </div>
              </Modal>

              <Modal refObj={nftTransferredModal} onClose={onTransferredClose} hideSubmit={true} >
                <div className="w-full p-2 mt-5">
                  <ArrowUpRightIcon className="stroke-primary"  />
                  <h2 className="modal-title">Ownership transferred</h2>
                  <p>New Owner: {ownershipDetails?.asset.owner || "? ? ?"}</p>
                </div>
              </Modal>

              <Modal refObj={changeWalletModal} onClose={onWalletChangeClose} onSubmit={onWalletInputChangeCommit} disableSubmit={!updatedBeneficiaryIsValid}>
                <div className="w-full p-2 mt-5">
                  <label>Enter E-Mail or Wallet (0x...)</label>
                  <input onChange={onWalletInputChange} value={updatedBeneficiary} className="input input-bordered" />
                </div>
              </Modal>
            </div>
					)}
				</main>
			</div>
		</StyledCollectionLayout>
	)
}

export default CollectionItemView
