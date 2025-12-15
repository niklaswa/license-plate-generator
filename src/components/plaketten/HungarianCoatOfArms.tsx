'use client';

import React from 'react';

interface HungarianCoatOfArmsProps {
  scale?: number;
}

export default function HungarianCoatOfArms({ scale = 1 }: HungarianCoatOfArmsProps) {
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
        src="/coa/hr.svg"
        alt="Hungarian coat of arms"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
