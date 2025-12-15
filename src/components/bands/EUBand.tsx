'use client';

import React from 'react';
import { Country } from '@/types/plate';

interface EUBandProps {
  scale?: number;
  countryCode?: Country;
  height?: number | string;  // Optional height for constrained layouts (e.g., Austria)
  noBorderRadius?: boolean;  // Remove border radius (for Austria)
  showDinGepruft?: boolean;  // Show DIN-GEPRÜFT seal for German plates
  borderRadius?: number;     // Border radius in scaled pixels (default 5)
}

export default function EUBand({ scale = 1, countryCode = 'D', height, noBorderRadius = false, showDinGepruft = false, borderRadius = 5 }: EUBandProps) {
  const width = 45 * scale;
  const defaultHeight = 110 * scale;
  const actualHeight = height || defaultHeight;
  const radius = borderRadius * scale;
  
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${8 * scale}px`,
        width: `${width}px`,
        height: actualHeight,
        backgroundColor: '#003399',
        borderRadius: noBorderRadius ? '0' : `${radius}px 0 0 ${radius}px`,
        padding: `${6 * scale}px ${4 * scale}px`,
      }}
    >
      {/* EU Stars with DIN-GEPRÜFT in center for German plates */}
      <div style={{ position: 'relative', width: `${36 * scale}px`, height: `${36 * scale}px` }}>
        <svg
          width={36 * scale}
          height={36 * scale}
          viewBox="0 0 36 36"
          fill="none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <g fill="#FFCC00">
            {/* 12 stars in a circle - all pointing upward */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const cx = Math.round((18 + 13 * Math.cos(angle)) * 1000) / 1000;
              const cy = Math.round((18 + 13 * Math.sin(angle)) * 1000) / 1000;
              return (
                <polygon
                  key={i}
                  points={createStarPoints(cx, cy, 2.5, 1.1)}
                />
              );
            })}
          </g>
        </svg>
        
        {/* DIN-GEPRÜFT seal in center of stars for German plates */}
        {showDinGepruft && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: '#003399',
            lineHeight: 0.9,
            opacity: 0.25,
            textShadow: `0 ${0.5 * scale}px ${0.5 * scale}px rgba(0,0,0,0.3), 0 ${-0.3 * scale}px 0 rgba(255,255,255,0.1)`,
          }}>
            <span style={{ 
              letterSpacing: `${0.4 * scale}px`,
              fontSize: `${5.5 * scale}px`,
            }}>DIN</span>
            <span style={{ 
              letterSpacing: `${0.2 * scale}px`, 
              fontSize: `${3.5 * scale}px`,
              fontWeight: 'normal',
            }}>GEPRÜFT</span>
            <span style={{ 
              letterSpacing: `${0.1 * scale}px`, 
              fontSize: `${3 * scale}px`, 
              fontWeight: 'normal',
              marginTop: `${0.3 * scale}px`,
            }}>74069/30</span>
          </div>
        )}
      </div>
      
      {/* Country code */}
      <span
        style={{
          color: '#FFFFFF',
          fontSize: `${countryCode.length > 2 ? 18 : countryCode.length > 1 ? 22 : 26}px`,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '1px',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {countryCode}
      </span>
    </div>
  );
}

function createStarPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.round((cx + r * Math.cos(angle)) * 1000) / 1000;
    const y = Math.round((cy + r * Math.sin(angle)) * 1000) / 1000;
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}
