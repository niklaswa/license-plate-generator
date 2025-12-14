'use client';

import React from 'react';
import Image from 'next/image';
import { SwissCanton } from '@/types/plate';

interface SwissCantonPlaketteProps {
  canton: SwissCanton;
  scale?: number;
}

export default function SwissCantonPlakette({ canton, scale = 1 }: SwissCantonPlaketteProps) {
  const size = 70 * scale;
  
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
        src={`/wappen/ch/${canton}.svg`}
        alt={`Wappen ${canton}`}
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
