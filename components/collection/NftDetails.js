import React, { useState, useEffect } from 'react';
import {BaseCard} from '@/components/collection'

const NftDetails = ({ assetData, ... props }) => {
  return (
    <BaseCard title="Details">
      <div className="overflow-x-auto">
        <table className="table">
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            {assetData?.links?.opensea && (
              <tr>
                <td>OpenSea</td>
                <td><a className="link" href={assetData.links.opensea}>View NFT on OpenSea</a></td>
              </tr>)}
            {assetData?.token_uri && (
              <tr>
                <td>Metadata</td>
                <td><a className="link" href={assetData.token_uri}>View Raw Metadata</a></td>
              </tr>)}
            </tbody>
        </table>
      </div>
    </BaseCard>
  );
};

export default NftDetails;
