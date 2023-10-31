import React, { useState, useEffect } from 'react';

const NFTImage = ({ assetData, ...props }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Immediately invoked async function inside the useEffect
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch(assetData.token_uri);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const metadata = await response.json();
        setImageUrl(metadata.image);
      } catch (e) {
        console.error("Fetching NFT metadata failed", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [assetData.token_uri]); // Run this effect only when token_uri changes

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading image: {error}</div>;

  // If we have an image URL, render it
  return imageUrl ? <a href={assetData.links.opensea}><img src={imageUrl} alt="NFT" {...props} /></a> : null;
};

export default NFTImage;
