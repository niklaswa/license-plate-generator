'use client';

import React from 'react';

interface HUPlaketteProps {
  year: number;
  month: number; // 1-12
  scale?: number;
}

// Colors for different years (rotating 6-year cycle) - official TÜV colors
// 2025=Orange, 2026=Blau, 2027=Gelb, 2028=Braun, 2029=Rosa, 2030=Grün, 2031=Orange...
const YEAR_COLORS: Record<number, string> = {
  0: '#FF5F00',  // Orange - 2025, 2031
  1: '#0066B3',  // Blau - 2026, 2032
  2: '#FFCC00',  // Gelb - 2027, 2033
  3: '#8B4513',  // Braun - 2028, 2034
  4: '#FF69B4',  // Rosa/Pink - 2029, 2035
  5: '#009640',  // Grün - 2030, 2036
};

// Month positions on the clock face (12 at top = 0°, counter-clockwise)
const MONTH_ANGLES: Record<number, number> = {
  12: 0, 1: -30, 2: -60, 3: -90, 4: -120, 5: -150,
  6: -180, 7: -210, 8: -240, 9: -270, 10: -300, 11: -330,
};

export default function HUPlakette({ year, month, scale = 1 }: HUPlaketteProps) {
  const size = 42 * scale;
  // 2025 = Orange (0), 2026 = Blau (1), 2027 = Gelb (2), etc.
  const colorKey = ((year - 2025) % 6 + 6) % 6; // Handle negative years correctly
  const bgColor = YEAR_COLORS[colorKey];
  const yearDisplay = String(year).slice(-2);
  
  // Rotation: Der ausgewählte Monat soll oben bei 0° stehen
  // Im Original-SVG ist 12 oben (bei 0°), Zahlen laufen gegen den Uhrzeigersinn
  // Monat 12 = 0°, Monat 1 = +30°, Monat 2 = +60°, etc.
  const rotation = month === 12 ? 0 : month * 30;
  
  // Calculate month number positions - they rotate with the plakette but text stays upright
  const radius = 170; // Distance from center for month numbers
  const center = 283.5;

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 566.9 566.9"
      >
        {/* Rotating part - circles and tick marks */}
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '283.5px 283.5px' }}>
          {/* Main circle with year color */}
          <circle 
            cx="283.5" 
            cy="283.5" 
            r="272.9" 
            fill={bgColor} 
            stroke="#000" 
            strokeWidth="10" 
            strokeMiterlimit="10"
          />
          {/* Inner circle */}
          <circle 
            cx="283.5" 
            cy="283.5" 
            r="73.9" 
            fill="none" 
            stroke="#000" 
            strokeWidth="10" 
            strokeMiterlimit="10"
          />
          
          {/* All the tick marks and month indicators from original SVG */}
          <g fill="#000" stroke="#000" strokeMiterlimit="10">
            {/* Outer ring segments */}
            <path d="M278.5,61.6v-51c-46.1,0.8-89.3,13.1-127.1,34l25.5,44.1C207.1,72.2,241.7,62.4,278.5,61.6z"/>
            <path d="M390.1,88.8l25.5-44.1c-37.8-20.9-81-33.2-127.1-34v51C325.2,62.4,359.8,72.2,390.1,88.8z"/>
            <path d="M61.5,283.5c0-1.7,0-3.3,0.1-5h-51c0,1.7-0.1,3.3-0.1,5c0,1.7,0,3.3,0.1,5h51C61.6,286.8,61.5,285.1,61.5,283.5z"/>
            <path d="M505.4,283.5c0,1.7,0,3.3-0.1,5h51c0-1.7,0.1-3.3,0.1-5c0-1.7,0-3.3-0.1-5h-51C505.4,280.1,505.4,281.8,505.4,283.5z"/>
            <path d="M283.5,505.4c-1.7,0-3.3,0-5-0.1v51c1.7,0,3.3,0.1,5,0.1c1.7,0,3.3,0,5-0.1v-51C286.8,505.4,285.1,505.4,283.5,505.4z"/>
            <path d="M176.8,88.8l-25.5-44.1c-2.9,1.6-5.8,3.3-8.7,5l25.5,44.1C171,92.1,173.9,90.4,176.8,88.8z"/>
            <path d="M390.1,478.1l25.5,44.1c2.9-1.6,5.8-3.3,8.7-5l-25.5-44.1C395.9,474.9,393,476.5,390.1,478.1z"/>
            <path d="M88.8,390.1l-44.1,25.5c1.6,2.9,3.3,5.8,5,8.7l44.1-25.5C92.1,395.9,90.4,393,88.8,390.1z"/>
            <path d="M478.1,176.8l44.1-25.5c-1.6-2.9-3.3-5.8-5-8.7l-44.1,25.5C474.9,171,476.5,173.9,478.1,176.8z"/>
            <path d="M398.7,93.8l25.5-44.1c-2.9-1.7-5.7-3.4-8.7-5l-25.5,44.1C393,90.4,395.9,92.1,398.7,93.8z"/>
            <path d="M168.2,473.1l-25.5,44.1c2.9,1.7,5.7,3.4,8.7,5l25.5-44.1C173.9,476.5,171,474.9,168.2,473.1z"/>
            <path d="M473.1,398.7l44.1,25.5c1.7-2.9,3.4-5.7,5-8.7l-44.1-25.5C476.5,393,474.9,395.9,473.1,398.7z"/>
            <path d="M93.8,168.2l-44.1-25.5c-1.7,2.9-3.4,5.7-5,8.7l44.1,25.5C90.4,173.9,92.1,171,93.8,168.2z"/>
            
            {/* Inner ring segments */}
            <path d="M278.5,209.8v-49.5c-18.7,1.2-36.2,6.5-51.7,15l24.2,41.9C259.3,213,268.6,210.4,278.5,209.8z"/>
            <path d="M316,217.1l25.5-44.1c-16-8-34-12.6-53-13v49.7C298.3,210.4,307.6,213,316,217.1z"/>
            <path d="M357.3,283.5c0,1.7-0.1,3.3-0.2,5h52.4c0.1-1.7,0.1-3.3,0.1-5c0-1.7,0-3.3-0.1-5h-52.4C357.3,280.1,357.3,281.8,357.3,283.5z"/>
            <path d="M209.6,283.5c0-1.7,0.1-3.3,0.2-5h-46.9c-0.1,1.7-0.1,3.3-0.1,5c0,1.7,0,3.3,0.1,5h46.9C209.7,286.8,209.6,285.1,209.6,283.5z"/>
            <path d="M283.5,357.3c-1.7,0-3.3-0.1-5-0.2v49.5c2.6,0.2,5.2,0.3,7.8,0.3c0.7,0,1.5,0,2.2,0v-49.7C286.8,357.3,285.1,357.3,283.5,357.3z"/>
            <path d="M316,349.8l25.5,44.1c3-1.5,5.9-3.1,8.8-4.8l-25.6-44.3C321.9,346.7,319,348.3,316,349.8z"/>
            <path d="M250.9,217.1l-24.2-41.9c-2.9,1.6-5.8,3.3-8.6,5.2l24.1,41.7C245,220.3,247.9,218.6,250.9,217.1z"/>
            <path d="M349.8,250.9l45.1-26.1c-1.6-2.9-3.3-5.8-5.1-8.6l-45,26C346.7,245,348.3,247.9,349.8,250.9z"/>
            <path d="M217.1,316l-40.9,23.6c1.5,3,3.2,5.9,4.9,8.7l40.9-23.6C220.3,321.9,218.6,319,217.1,316z"/>
            <path d="M324.7,222.1l25.6-44.3c-2.8-1.7-5.8-3.3-8.8-4.8L316,217.1C319,218.6,321.9,220.3,324.7,222.1z"/>
            <path d="M242.3,344.8l-24.1,41.7c2.8,1.8,5.6,3.6,8.6,5.2l24.2-41.9C247.9,348.3,245,346.7,242.3,344.8z"/>
            <path d="M222.1,242.3l-40.9-23.6c-1.7,2.8-3.4,5.7-4.9,8.7l40.9,23.6C218.6,247.9,220.3,245,222.1,242.3z"/>
            <path d="M344.8,324.7l45,26c1.8-2.8,3.5-5.7,5.1-8.6L349.8,316C348.3,319,346.7,321.9,344.8,324.7z"/>
          </g>
          
          {/* Month numbers - inside rotating group, each rotated so bottom faces center */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => {
            const originalAngle = MONTH_ANGLES[m];
            const angleRad = (originalAngle * Math.PI) / 180;
            
            // Calculate x,y position on the circle
            const x = center + radius * Math.round(Math.sin(angleRad) * 1000) / 1000;
            const y = center - radius * Math.round(Math.cos(angleRad) * 1000) / 1000;
            
            return (
              <text
                key={m}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: '72px',
                  fontWeight: '700',
                  fill: '#000',
                  stroke: '#000',
                  strokeWidth: '1.5px',
                  fontFamily: '"Google Sans", sans-serif',
                  // Rotate each number so its bottom faces the center
                  transform: `rotate(${originalAngle}deg)`,
                  transformOrigin: `${x}px ${y}px`,
                }}
              >
                {m}
              </text>
            );
          })}
          
          {/* Year display in center - rotates with plakette (aligned to 12) */}
          <text
            x="283.5"
            y="300"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '90px',
              fontWeight: 'bold',
              fill: '#000',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {yearDisplay}
          </text>
        </g>
      </svg>
    </div>
  );
}
