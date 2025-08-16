import React, { useState, useEffect } from 'react';
import {Button} from '@/components/ui'
import {BaseCard} from '@/components/collection'
import { formatAddress } from '@/lib/utils';

const NftOwnership = ({ beneficiary, currentOwner, isOwned, onClaim,  attestationValid, secondsToExpire, ... props }) => {
  const [error, setError] = useState(null);
  
  return (
    <BaseCard title="Owner">
      <div>
        {formatAddress(currentOwner)} 
        {(isOwned && <strong className="ml-2">(That's you!) </strong>)}
      </div>
      
      <div className="card-actions justify-end">
        {(!isOwned && 
          <Button onClick={onClaim} hidden={!attestationValid} className="btn btn-outline">
            { attestationValid && (<span>Claim within {secondsToExpire} sec</span>)}
            { !attestationValid && (<span>Claim invalid.</span>)}
          </Button>
          )}
        {(!isOwned && !attestationValid) && (
          <div>
            Scan (again) to claim via <a className="link" href="https://scan.metaanchor.io/">MetaAnchor-App</a>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default NftOwnership;
