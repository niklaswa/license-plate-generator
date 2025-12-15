'use client';

import React from 'react';
import Image from 'next/image';

interface CoatOfArmsProps {
  src: string;
  alt: string;
  scale?: number;
  size?: number; // base size before scaling (default 50)
  isHovering?: boolean;
  tilt?: { rotateX: number; rotateY: number };
  useNextImage?: boolean; // use Next.js Image component for optimization
}

export default function CoatOfArms({ 
  src, 
  alt, 
  scale = 1, 
  size = 50,
  isHovering = false, 
  tilt = { rotateX: 0, rotateY: 0 },
  useNextImage = true,
}: CoatOfArmsProps) {
  const computedSize = size * scale;
  
  // Calculate shimmer position based on tilt
  const shimmerX = 50 + (tilt.rotateY * 3);
  const shimmerY = 50 + (tilt.rotateX * 3);
  
  return (
    <div
      style={{
        width: `${computedSize}px`,
        height: `${computedSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {useNextImage ? (
        <Image
          src={src}
          alt={alt}
          width={computedSize}
          height={computedSize}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
      {/* Dynamic shimmer overlay - uses mask-image to only show on SVG content */}
      {isHovering && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at ${shimmerX}% ${shimmerY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)`,
            pointerEvents: 'none',
            maskImage: `url(${src})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(${src})`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
}
