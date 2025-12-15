'use client';

import React from 'react';
import Image from 'next/image';

interface UKBandProps {
  scale?: number;
  height?: number | string;
  showFlag: boolean;  // Show UK flag + text
  isEV: boolean;      // Green background for EV
  borderRadius?: number;
}

export default function UKBand({ scale = 1, height, showFlag, isEV, borderRadius = 5 }: UKBandProps) {
  const width = 40 * scale;
  const defaultHeight = 110 * scale;
  const actualHeight = height || defaultHeight;
  const radius = borderRadius * scale;
  
  // Green only strip (EV without flag)
  if (!showFlag && isEV) {
    return (
      <div 
        style={{
          width: `${width}px`,
          height: actualHeight,
          backgroundColor: '#00A651',
          borderRadius: `${radius}px 0 0 ${radius}px`,
        }}
      />
    );
  }
  
  // Flag + UK text (green for EV, transparent otherwise)
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${6 * scale}px`,
        width: `${width}px`,
        height: actualHeight,
        backgroundColor: isEV ? '#00A651' : 'transparent',
        borderRadius: `${radius}px 0 0 ${radius}px`,
        padding: `${6 * scale}px ${2 * scale}px`,
      }}
    >
      {/* UK Flag */}
      <div style={{ 
        width: `${28 * scale}px`, 
        height: `${18 * scale}px`,
        position: 'relative',
        borderRadius: `${2 * scale}px`,
        overflow: 'hidden',
        boxShadow: `0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.3)`,
      }}>
        <Image
          src="/flags/uk.svg"
          alt="UK Flag"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      {/* UK text */}
      <span
        style={{
          color: isEV ? '#FFFFFF' : '#000000',
          fontSize: `${18 * scale}px`,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '1px',
          textShadow: isEV ? `0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.3)` : 'none',
        }}
      >
        UK
      </span>
    </div>
  );
}
