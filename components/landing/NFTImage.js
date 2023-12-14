import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import { Button } from '@/components/ui'
import playIcon from '@/public/icons/play.svg'
import stopIcon from '@/public/icons/stop.svg'



const NFTImage = ({ assetData, ...props }) => {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch(assetData.token_uri);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const fetchedMetadata = await response.json();
        setMetadata(fetchedMetadata);
      } catch (e) {
        console.error("Fetching NFT metadata failed", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [assetData.token_uri]);

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  const stopVideo = () => {
    setIsVideoPlaying(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading image: {error}</div>;
  if (!metadata) return null;

  return (
    <div style={{ position: 'relative' }}>
      {isVideoPlaying ? (
        <>
          <video width="100%" height="auto" controls autoPlay muted loop>
            <source src={metadata.animation_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Button
            onClick={stopVideo}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              padding: '10px 15px',
            }}
          >
            <Image src={stopIcon} priority height={50} width={50} />
          </Button>
        </>
      ) : (
        <>
          <a href={assetData.links.opensea}>
            <img src={metadata.image} alt="NFT" {...props} />
          </a>
          {metadata.animation_url && (
            <Button
              onClick={playVideo}
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                padding: '10px 15px',
              }}
            >
              <Image src={playIcon} priority height={50} width={50} />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default NFTImage;
