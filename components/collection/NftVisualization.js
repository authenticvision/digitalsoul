import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import {BaseCard} from '@/components/collection'
import { Button } from '@/components/ui'
import playIcon from '@/public/icons/play.svg'
import stopIcon from '@/public/icons/stop.svg'

const NftVisualization = ({ metaData, isOwned=false, ...props }) => {
  const [metadata, setMetadata] = useState(metaData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  const stopVideo = () => {
    setIsVideoPlaying(false);
  };

  if (!metadata) return null;

  return (

    <div className="card border border-secondary w-full shadow-xl">
        <figure style={{ position: 'relative' }} className="flex justify-center">
          {isOwned && (<div className="absolute top-0 right-0 w-64 p-3 text-center text-primary-content bg-primary transform rotate-45 translate-x-16 translate-y-12 z-10">
            owned by you
          </div>)}          
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
                bottom: 50,
                right: 50,
              }}
              className="btn-ghost w-15 h-15"
            >
              <Image src={stopIcon} priority className="w-full h-full"/>
            </Button>
          </>
        ) : (
          <>
            <img src={metadata.image} alt="NFT-Image" width="100%"/>
            {metadata.animation_url && (
              <Button
                onClick={playVideo}
                style={{
                  position: 'absolute',
                  bottom: 50,
                  right: 50,
                }}
                className="btn-ghost w-15 h-15"
              >
                <Image src={playIcon} priority className="w-full h-full"/>
              </Button>
            )}
          </>
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{metaData.name}</h2>
        <p>{metaData.description}</p>
        { metaData.external_url && 
          (
            <div className="flex justify-end">
              <a href={metadata.external_url}>
                <Button className="btn btn-outline">
                  Open website
                </Button>
              </a>
            </div>
          )}
      </div>
    </div>
  );
};

export default NftVisualization;
