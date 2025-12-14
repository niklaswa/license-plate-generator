'use client';

import React from 'react';
import Image from 'next/image';

interface SwissCoatOfArmsProps {
  scale?: number;
}

// Swiss national coat of arms - displayed on the left side of Swiss plates
export default function SwissCoatOfArms({ scale = 1 }: SwissCoatOfArmsProps) {
  const size = 50 * scale;
  
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Image
        src="/wappen/ch/CH.svg"
        alt="Schweizer Wappen"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
