'use client';

import React from 'react';

interface BundeswehrPlaketteProps {
  scale?: number;
  isHovering?: boolean;
  tilt?: { rotateX: number; rotateY: number };
}

const BundeswehrPlakette: React.FC<BundeswehrPlaketteProps> = ({ scale = 1, isHovering = false, tilt = { rotateX: 0, rotateY: 0 } }) => {
  const size = 42 * scale;
  const topText = 'BUNDESWEHR';
  const bottomText = 'ZULASSUNGSSTELLE';
  
  // Calculate shimmer position based on tilt
  const shimmerX1 = 50 + (tilt.rotateY * 2);
  const shimmerY1 = 50 + (tilt.rotateX * 2);
  const shimmerX2 = 50 - (tilt.rotateY * 2);
  const shimmerY2 = 50 - (tilt.rotateX * 2);
  
  // Font sizes
  const topFontSize = 7;
  const bottomFontSize = 5.5;
  
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
          <linearGradient id="shimmer-bundeswehr" x1={`${shimmerX1}%`} y1={`${shimmerY1}%`} x2={`${shimmerX2}%`} y2={`${shimmerY2}%`}>
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="30%" stopColor="rgba(150,200,255,0.15)" />
            <stop offset="50%" stopColor="rgba(255,150,255,0.2)" />
            <stop offset="70%" stopColor="rgba(150,255,200,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          {/* Security pattern - guilloche style */}
          <pattern id="securityPattern-bundeswehr" patternUnits="userSpaceOnUse" width="20" height="20">
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
          <pattern id="radialSecurity-bundeswehr" patternUnits="userSpaceOnUse" width="100" height="100">
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
        
        {/* Security pattern layer */}
        <circle cx="50" cy="50" r="47" fill="url(#securityPattern-bundeswehr)" />
        
        {/* Inner rings */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#bbb" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#ccc" strokeWidth="0.3" />
        
        {/* Text paths */}
        <defs>
          <path
            id="topArc-bundeswehr"
            d="M 8,52 A 42,42 0 0,1 92,52"
            fill="none"
          />
          <path
            id="bottomArc-bundeswehr"
            d="M 6,50 A 44,44 0 0,0 94,50"
            fill="none"
          />
        </defs>
        
        {/* BUNDESWEHR at top */}
        <text
          fontSize={topFontSize}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          fill="#000"
        >
          <textPath
            href="#topArc-bundeswehr"
            startOffset="50%"
            textAnchor="middle"
          >
            {topText}
          </textPath>
        </text>
        
        {/* Bundesadler in center */}
        <image
          href="/coa/de/bundesadler.svg"
          x="25"
          y="25"
          width="50"
          height="50"
          preserveAspectRatio="xMidYMid meet"
        />
        
        {/* ZULASSUNGSSTELLE at bottom */}
        <text
          fontSize={bottomFontSize}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          fill="#000"
        >
          <textPath
            href="#bottomArc-bundeswehr"
            startOffset="50%"
            textAnchor="middle"
          >
            {bottomText}
          </textPath>
        </text>
        
        {/* Holographic shimmer overlay - only visible on hover */}
        {isHovering && <circle cx="50" cy="50" r="47" fill="url(#shimmer-bundeswehr)" />}
      </svg>
    </div>
  );
};

export default BundeswehrPlakette;
