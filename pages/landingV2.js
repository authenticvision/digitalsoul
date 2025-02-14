// pages/index.js
import { decodeAttestation } from '@/lib/serverUtils'
import { jsonify, generateCollectionURL } from '@/lib/utils'
import { Alert } from '@/components/ui'
import prisma from "@/lib/prisma"


// THIS COMPONENT WILL BE REMOVED
// This whole component is temporarily and will be replaced by an MetaAnchor-internal routing, which directly will call the 
// collectionURL with Attestation-Parameters.
// AV Internal Ticket: AVI-16675

export async function getServerSideProps(context) {
  const {av_beneficiary, av_attestation} = context.query;
  const attestation = av_attestation ? await decodeAttestation(av_attestation) : null;
  const avAttestationToken = av_attestation || null;
  let avBeneficiary = av_beneficiary || null;

  function makeErrorProps(errorMsg) {
    return {props: {error: errorMsg}}
  }

  if(!attestation) {
    return makeErrorProps("Invalid attestation. Please scan again or contact collection owner");
  }

  if(attestation.secondsToExpiry() < 0) {
    return makeErrorProps("Attestation expired. Please scan again!")
  }

  const slid = attestation.getSlid();
  const extrefs = attestation.getPayload().extrefs;
  let csn = "";

  if(extrefs) {
    for (const entry of extrefs) {
      const jEntry = jsonify(entry)
      if(jEntry) {
        if(jEntry?._api == "metaanchor") {
          csn = jEntry.csn;
          break;
        }
      }
    }
  }

  // Retrieve SLID from token
  const dbNft = await prisma.NFT.findFirst({
    where: {
      slid: {
        equals: slid,
        mode: "insensitive"
      },
      contract: {
        csn: {
          equals: csn,
					mode: "insensitive"
        }
      },
    },
    include: {
      contract: true,
    }
  })

  if(!dbNft) {
    return makeErrorProps(`No DigitalSoul for label ${slid} found in collection "${csn}"`);
  }

  let forwardURL = `${generateCollectionURL(dbNft)}?av_attestation=${avAttestationToken}`
  if(av_beneficiary) {
    forwardURL = `${forwardURL}&av_beneficiary=${av_beneficiary}`

  }

	return {
		props: {
      av_attestation_token: avAttestationToken,
      av_beneficiary: avBeneficiary,
      anchor: dbNft.anchor,
      csn: dbNft.contract.csn,
      error: null,
      refreshContent : `0;url=${forwardURL}`,
      forwardUrl: forwardURL
		}
	}
}

const LandingPage = ({ error, av_attestation_token, av_beneficiary, anchor, csn, refreshContent, forwardURL, ...props }) => {
  return (
    <div className="page container w-full py-5 px-2 my-0 mx-auto">
      <main className="flex flex-col">
        <div className="flex justify-center py-2">
          {error && (
            <Alert type='error' text={error} />
          )}
        </div>

        {!error && (
          <div>
            Redirecting.... If you're not redirected within 3sec, please <a href={forwardURL}>CLICK HERE</a>            
            <meta http-equiv="refresh" content={refreshContent} />      
          </div>

        )}			
      </main>
    </div>
  )
}

export default LandingPage;
