'use client';

import React from 'react';

interface SlovakCoatOfArmsProps {
  scale?: number;
}

export default function SlovakCoatOfArms({ scale = 1 }: SlovakCoatOfArmsProps) {
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
      <img
        src="/coa/sk.svg"
        alt="Slovak coat of arms"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
