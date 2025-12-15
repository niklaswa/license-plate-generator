'use client';

import React from 'react';
import { AustrianState, AUSTRIAN_STATE_NAMES } from '@/types/plate';

interface AustrianStatePlaketteProps {
  state: AustrianState;
  scale?: number;
}

export default function AustrianStatePlakette({ state, scale = 1 }: AustrianStatePlaketteProps) {
  const width = 50 * scale;
  const height = 60 * scale;
  
  // Safety check for undefined state
  if (!state || !(state in AUSTRIAN_STATE_NAMES)) {
    return null;
  }
  
  const imagePath = `/coa/at/${state}.svg`;
  const stateName = AUSTRIAN_STATE_NAMES[state].toUpperCase();
  
  // Calculate compression based on text length
  const fontSize = 7 * scale;
  const avgCharWidth = fontSize * 0.65; // Approximate character width for bold Arial
  const textWidth = stateName.length * avgCharWidth;
  const compressionRatio = textWidth > width ? width / textWidth : 1;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        flexShrink: 0,
      }}
    >
      {/* Coat of arms - plain, no circle */}
      <img
        src={imagePath}
        alt={stateName}
        style={{
          width: `${width}px`,
          height: `${width}px`,
          objectFit: 'contain',
        }}
      />
      
      {/* State name below - constrained to emblem width */}
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: `${fontSize}px`,
          fontWeight: 'bold',
          color: '#000',
          textAlign: 'center',
          lineHeight: 1,
          width: `${width}px`,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <span style={{
          display: 'inline-block',
          transform: `scaleX(${compressionRatio})`,
          transformOrigin: 'center center',
          whiteSpace: 'nowrap',
        }}>
          {stateName}
        </span>
      </div>
    </div>
  );
}
