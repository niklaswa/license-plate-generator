'use client';

import React from 'react';
import { GermanState, STATE_NAMES } from '@/types/plate';

interface StatePlaketteProps {
  state: GermanState;
  city?: string;
  scale?: number;
  isHovering?: boolean;
  tilt?: { rotateX: number; rotateY: number };
}

// Mapping from state code to SVG filename
const STATE_IMAGE_MAP: Record<GermanState, string> = {
  BW: 'baden-wuerttemberg',
  BY: 'bayern',
  BE: 'berlin',
  BB: 'brandenburg',
  HB: 'bremen',
  HH: 'hamburg',
  HE: 'hessen',
  MV: 'mecklenburg-vorpommern',
  NI: 'niedersachsen',
  NW: 'nordrhein-westfalen',
  RP: 'rheinland-pfalz',
  SL: 'saarland',
  SN: 'sachsen',
  ST: 'sachsen-anhalt',
  SH: 'schleswig-holstein',
  TH: 'thueringen',
};

export default function StatePlakette({ state, city = '', scale = 1, isHovering = false, tilt = { rotateX: 0, rotateY: 0 } }: StatePlaketteProps) {
  const size = 42 * scale;
  
  // Get image path and names for German states
  const imagePath = `/coa/de/${STATE_IMAGE_MAP[state]}.svg`;
  const cityText = city.toUpperCase();
  const stateName = STATE_NAMES[state].toUpperCase();
  
  // Calculate shimmer position based on tilt
  const shimmerX1 = 50 + (tilt.rotateY * 2);
  const shimmerY1 = 50 + (tilt.rotateX * 2);
  const shimmerX2 = 50 - (tilt.rotateY * 2);
  const shimmerY2 = 50 - (tilt.rotateX * 2);
  
  // Calculate font size based on text length for city - larger base
  const baseFontSize = 8;
  const cityFontSize = cityText.length > 20 
    ? baseFontSize * 0.55
    : cityText.length > 15 
      ? baseFontSize * 0.7 
      : cityText.length > 10 
        ? baseFontSize * 0.85 
        : cityText.length > 7 
          ? baseFontSize * 1.0 
          : baseFontSize * 1.2;
  
  // Calculate font size for state name - larger base
  const stateFontSize = stateName.length > 18
    ? baseFontSize * 0.45
    : stateName.length > 12
      ? baseFontSize * 0.55
      : stateName.length > 8
        ? baseFontSize * 0.7
        : baseFontSize * 0.9;
  
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Holographic shimmer gradient */}
          <linearGradient id={`shimmer-${state}`} x1={`${shimmerX1}%`} y1={`${shimmerY1}%`} x2={`${shimmerX2}%`} y2={`${shimmerY2}%`}>
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="30%" stopColor="rgba(150,200,255,0.15)" />
            <stop offset="50%" stopColor="rgba(255,150,255,0.2)" />
            <stop offset="70%" stopColor="rgba(150,255,200,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          {/* Security pattern - guilloche style */}
          <pattern id={`securityPattern-${state}`} patternUnits="userSpaceOnUse" width="20" height="20">
            <path 
              d="M 0,10 Q 5,0 10,10 T 20,10" 
              fill="none" 
              stroke="#c0c0c0" 
              strokeWidth="0.5"
            />
            <path 
              d="M 0,15 Q 5,5 10,15 T 20,15" 
              fill="none" 
              stroke="#d0d0d0" 
              strokeWidth="0.4"
            />
            <path 
              d="M 0,5 Q 5,15 10,5 T 20,5" 
              fill="none" 
              stroke="#c8c8c8" 
              strokeWidth="0.4"
            />
          </pattern>
          {/* Radial security lines */}
          <pattern id={`radialSecurity-${state}`} patternUnits="userSpaceOnUse" width="100" height="100">
            {[...Array(36)].map((_, i) => {
              const x2 = Math.round((50 + 50 * Math.cos((i * 10 * Math.PI) / 180)) * 1000) / 1000;
              const y2 = Math.round((50 + 50 * Math.sin((i * 10 * Math.PI) / 180)) * 1000) / 1000;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  stroke="#e0e0e0"
                  strokeWidth="0.3"
                />
              );
            })}
          </pattern>
        </defs>
        
        {/* Base circle with light gray */}
        <circle cx="50" cy="50" r="49" fill="#e8e8e8" stroke="#333" strokeWidth="1.5" />
        
        {/* Security pattern layer - covers entire circle */}
        <circle cx="50" cy="50" r="47" fill={`url(#securityPattern-${state})`} />
        
        {/* Inner rings */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#bbb" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#ccc" strokeWidth="0.3" />
        
        {/* State name at top (curved) - closer to edge */}
        <defs>
          <path
            id={`stateArc-${state}`}
            d="M 8,52 A 42,42 0 0,1 92,52"
            fill="none"
          />
          <path
            id={`cityArc-${state}`}
            d="M 6,50 A 44,44 0 0,0 94,50"
            fill="none"
          />
        </defs>
        
        {/* State name at top */}
        <text
          fontSize={stateFontSize}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          fill="#000"
        >
          <textPath
            href={`#stateArc-${state}`}
            startOffset="50%"
            textAnchor="middle"
          >
            {stateName}
          </textPath>
        </text>
        
        {/* Coat of arms in center - no white background, pattern shows through */}
        <image
          href={imagePath}
          x="25"
          y="25"
          width="50"
          height="50"
          preserveAspectRatio="xMidYMid meet"
        />
        
        {/* City name at bottom (curved) */}
        {cityText && (
          <text
            fontSize={cityFontSize}
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            fill="#000"
          >
            <textPath
              href={`#cityArc-${state}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {cityText}
            </textPath>
          </text>
        )}
        
        {/* Holographic shimmer overlay - only visible on hover */}
        {isHovering && <circle cx="50" cy="50" r="47" fill={`url(#shimmer-${state})`} />}
      </svg>
    </div>
  );
}
