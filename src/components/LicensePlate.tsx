'use client';

import React, { forwardRef, useRef, useState, useLayoutEffect, useEffect } from 'react';
import { GermanPlateConfig, PlateStyle } from '@/types/plate';
import EUBand from './EUBand';
import StatePlakette from './StatePlakette';
import HUPlakette from './HUPlakette';
import BundeswehrPlakette from './BundeswehrPlakette';

interface LicensePlateProps {
  config: GermanPlateConfig;
  scale?: number;
}

// Get styles based on plate style
function getPlateStyles(style: PlateStyle, scale: number) {
  const is3D = style !== 'normal';
  const isGlossy = style.includes('glossy');
  const isCarbon = style.includes('carbon');
  const isBlack = style.includes('black');
  
  const borderColor = '#000';
  
  // Text shadow - glossy has inner edge highlights for embossed look
  const textShadow = is3D 
    ? isGlossy
      ? `
        ${-1 * scale}px ${-1 * scale}px ${0}px rgba(255,255,255,0.6),
        ${-0.5 * scale}px ${-0.5 * scale}px ${0}px rgba(255,255,255,0.4),
        ${0.5 * scale}px ${0.5 * scale}px ${0}px rgba(0,0,0,0.3),
        ${1 * scale}px ${1 * scale}px ${0}px rgba(0,0,0,0.4),
        ${2 * scale}px ${2 * scale}px ${0}px rgba(0,0,0,0.3),
        ${3 * scale}px ${3 * scale}px ${1 * scale}px rgba(0,0,0,0.2)
      `
      : `
        ${1 * scale}px ${1 * scale}px ${0}px rgba(0,0,0,0.5),
        ${2 * scale}px ${2 * scale}px ${0}px rgba(0,0,0,0.4),
        ${3 * scale}px ${3 * scale}px ${0}px rgba(0,0,0,0.3)
      `
    : 'none';
  
  return { borderColor, textShadow, is3D, isGlossy, isCarbon, isBlack };
}

// Country-specific plate features (visual elements, not colors - those come from config)
function getCountryFeatures(country: string): { 
  hasRedStripes: boolean;      // Austria
  hasRightBand: boolean;       // France, Italy, Portugal
  rightBandColor: string;      // Color for right band
  rightBandTextColor: string;  // Text color for right band
} {
  const defaultFeatures = {
    hasRedStripes: false,
    hasRightBand: false,
    rightBandColor: '#003399',
    rightBandTextColor: '#FFFFFF',
  };
  
  switch (country) {
    case 'A': // Austria - has red stripes top and bottom
      return { ...defaultFeatures, hasRedStripes: true };
    case 'F': // France - has right blue band with region code
      return { 
        ...defaultFeatures, 
        hasRightBand: true, 
        rightBandColor: '#003399',
        rightBandTextColor: '#FFFFFF',
      };
    case 'I': // Italy - has right blue band with region code
      return { 
        ...defaultFeatures, 
        hasRightBand: true, 
        rightBandColor: '#003399',
        rightBandTextColor: '#FFFFFF',
      };
    case 'P': // Portugal - has right yellow band
      return { 
        ...defaultFeatures, 
        hasRightBand: true, 
        rightBandColor: '#FFD700',
        rightBandTextColor: '#000000',
      };
    default:
      return defaultFeatures;
  }
}

const LicensePlate = forwardRef<HTMLDivElement, LicensePlateProps>(
  ({ config, scale = 1 }, ref) => {
    const { cityCode, letters, numbers, suffix, showStatePlakette, showHUPlakette, state, city, huYear, huMonth, width, plateStyle, country, fontColor, backgroundColor, plateText, rightBandText } = config;
    
    const contentRef = useRef<HTMLDivElement>(null);
    const plateRef = useRef<HTMLDivElement>(null);
    const [compressionRatio, setCompressionRatio] = useState(1);
    const [fontLoaded, setFontLoaded] = useState(false);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [isHovering, setIsHovering] = useState(false);

    // Handle mouse move for 3D tilt effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!plateRef.current) return;
      const rect = plateRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degrees for subtler parallax
      const rotateY = ((x - centerX) / centerX) * 15; // Max 15 degrees for subtler parallax
      setTilt({ rotateX, rotateY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setTilt({ rotateX: 0, rotateY: 0 });
    };
    
    // Wait for EuroPlate font to load
    useEffect(() => {
      if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.ready.then(() => {
          setFontLoaded(true);
        });
        // Also check if already loaded
        document.fonts.load('105px EuroPlate').then(() => {
          setFontLoaded(true);
        });
      } else {
        // Fallback for browsers without font loading API
        setTimeout(() => setFontLoaded(true), 100);
      }
    }, []);
    
    // Plate dimensions
    const plateHeight = 110 * scale;
    const euBandWidth = 45 * scale;
    const borderWidth = 3 * scale;
    const padding = 12 * scale; // Padding on each side of content
    const maxPlateWidth = width === 'standard' ? 520 * scale : calculateCompactWidth(config) * scale;
    const plateWidth = maxPlateWidth;
    
    const isGermany = country === 'D';
    const fontSize = 105 * scale;
    const styles = getPlateStyles(plateStyle, scale);
    
    // Get country-specific features (visual elements, not colors)
    const countryFeatures = getCountryFeatures(country);
    // Colors come directly from config (set by PlateGenerator on country change)
    const textColor = fontColor;
    const plateBgColor = backgroundColor;
    const redStripeHeight = 5 * scale;
    
    // Available width for content (after EU band, borders, padding, and right band if present)
    const rightBandWidth = countryFeatures.hasRightBand ? euBandWidth : 0;
    const availableWidth = plateWidth - euBandWidth - rightBandWidth - (borderWidth * 2) - (padding * 2);
    
    // Create a content key that changes when content changes - forces remeasurement
    const contentKey = `${cityCode}-${letters}-${numbers}-${suffix}-${showStatePlakette}-${showHUPlakette}-${plateText}-${country}`;
    
    // Measure content and calculate compression after render AND after font loads
    useLayoutEffect(() => {
      if (contentRef.current && fontLoaded) {
        // Directly manipulate transform for measurement to avoid React state timing issues
        const el = contentRef.current;
        const originalTransform = el.style.transform;
        
        // Remove transform to measure natural width
        el.style.transform = 'none';
        
        // Force synchronous reflow
        void el.offsetWidth;
        const contentWidth = el.scrollWidth;
        
        if (contentWidth > availableWidth) {
          const ratio = availableWidth / contentWidth;
          const newRatio = Math.max(0.65, ratio);
          setCompressionRatio(newRatio);
          // Apply immediately to avoid flash
          el.style.transform = `scaleX(${newRatio})`;
        } else {
          setCompressionRatio(1);
          el.style.transform = originalTransform;
        }
      }
    }, [contentKey, availableWidth, scale, fontLoaded]);
    
    const baseTextStyle: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      fontWeight: 'normal',
      letterSpacing: `${2 * scale}px`,
      whiteSpace: 'nowrap',
    };
    
    // Carbon fiber pattern - diagonal stripes
    const stripeWidth = 2 * scale;
    
    const textStyle: React.CSSProperties = styles.isCarbon 
      ? {
          ...baseTextStyle,
          color: 'transparent',
          backgroundImage: styles.isGlossy 
            ? `
              linear-gradient(
                150deg,
                rgba(255,255,255,0.5) 0%,
                rgba(255,255,255,0.2) 20%,
                transparent 40%,
                transparent 60%,
                rgba(255,255,255,0.15) 80%,
                rgba(255,255,255,0.35) 100%
              ),
              repeating-linear-gradient(
                -45deg,
                #222 0px,
                #222 ${stripeWidth}px,
                #444 ${stripeWidth}px,
                #444 ${stripeWidth * 2}px,
                #222 ${stripeWidth * 2}px,
                #222 ${stripeWidth * 3}px,
                #333 ${stripeWidth * 3}px,
                #333 ${stripeWidth * 4}px
              )
            `
            : `
              repeating-linear-gradient(
                -45deg,
                #0a0a0a 0px,
                #0a0a0a ${stripeWidth}px,
                #1a1a1a ${stripeWidth}px,
                #1a1a1a ${stripeWidth * 2}px,
                #0a0a0a ${stripeWidth * 2}px,
                #0a0a0a ${stripeWidth * 3}px,
                #151515 ${stripeWidth * 3}px,
                #151515 ${stripeWidth * 4}px
              )
            `,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(${1 * scale}px ${1 * scale}px 0 rgba(80,80,80,0.5)) drop-shadow(${-0.5 * scale}px ${-0.5 * scale}px 0 rgba(0,0,0,0.8))`,
        }
      : {
          ...baseTextStyle,
          color: textColor,
          textShadow: styles.textShadow,
        };
    
    const whiteBorderWidth = styles.is3D ? 0 : 1.5 * scale;
    
    return (
      <div
        ref={ref}
        style={{
          perspective: '1500px',
          display: 'inline-block',
          flexShrink: 0,
          flexGrow: 0,
        }}
      >
        <div
          ref={plateRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            display: 'inline-block',
            padding: `${whiteBorderWidth}px`,
            backgroundColor: styles.is3D ? 'transparent' : '#fff',
            borderRadius: `${10 * scale}px`,
            transform: `
              rotateX(${tilt.rotateX}deg) 
              rotateY(${tilt.rotateY}deg)
              translateZ(${isHovering ? 30 * scale : 0}px)
            `,
            transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformStyle: 'preserve-3d',
            boxShadow: isHovering 
              ? `
                ${-tilt.rotateY * 3}px ${tilt.rotateX * 3}px ${30 * scale}px rgba(0,0,0,0.4),
                ${-tilt.rotateY * 1.5}px ${tilt.rotateX * 1.5}px ${15 * scale}px rgba(0,0,0,0.2),
                ${-tilt.rotateY * 0.5}px ${tilt.rotateX * 0.5}px ${5 * scale}px rgba(0,0,0,0.15)
              `
              : `0px 4px 8px rgba(0,0,0,0.1)`,
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: `${plateWidth}px`,
              height: `${plateHeight}px`,
              backgroundColor: plateBgColor,
              border: `${borderWidth}px solid ${styles.borderColor}`,
              borderRadius: `${8 * scale}px`,
              fontFamily: 'EuroPlate, sans-serif',
              transformStyle: 'preserve-3d',
              overflow: 'hidden',
              boxShadow: styles.is3D 
                ? `inset ${2 * scale}px ${2 * scale}px ${4 * scale}px rgba(255,255,255,0.5), inset ${-1 * scale}px ${-1 * scale}px ${3 * scale}px rgba(0,0,0,0.15)` 
                : 'none',
            }}
          >
          {/* Austrian red stripes */}
          {countryFeatures.hasRedStripes && (
            <>
              <div style={{
                position: 'absolute',
                top: 0,
                left: `${euBandWidth}px`,
                right: 0,
                height: `${redStripeHeight}px`,
                backgroundColor: '#C8102E',
                zIndex: 1,
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: `${euBandWidth}px`,
                right: 0,
                height: `${redStripeHeight}px`,
                backgroundColor: '#C8102E',
                zIndex: 1,
              }} />
            </>
          )}
          
          {/* EU Band or German Flag for military */}
          {country === 'D' && cityCode === 'Y' ? (
            /* German Flag for military plates */
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${euBandWidth}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${15 * scale}px ${4 * scale}px`,
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: `${2 * scale}px`,
                overflow: 'hidden',
              }}>
                <div style={{ flex: 1, backgroundColor: '#000000' }} />
                <div style={{ flex: 1, backgroundColor: '#DD0000' }} />
                <div style={{ flex: 1, backgroundColor: '#FFCE00' }} />
              </div>
            </div>
          ) : (
            /* Standard EU Band */
            <EUBand scale={scale} countryCode={country} />
          )}
          
          {/* Right band for France, Italy, Portugal */}
          {countryFeatures.hasRightBand && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${euBandWidth}px`,
              backgroundColor: countryFeatures.rightBandColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: countryFeatures.rightBandTextColor,
              fontSize: `${14 * scale}px`,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              zIndex: 2,
            }}>
              {rightBandText && (
                <span>{rightBandText}</span>
              )}
            </div>
          )}
          
          {/* Content area - fixed width, centered content */}
          <div 
            style={{ 
              position: 'absolute',
              left: `${euBandWidth}px`,
              right: countryFeatures.hasRightBand ? `${euBandWidth}px` : 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `0 ${padding}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Scalable content wrapper */}
            <div
              ref={contentRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${16 * scale}px`,
                transform: compressionRatio < 1 ? `scaleX(${compressionRatio})` : undefined,
                transformOrigin: 'center',
                transformStyle: 'preserve-3d',
              }}
            >
              {isGermany ? (
                <>
                  {cityCode === 'Y' ? (
                    /* Military format: Y-123456 with Bundeswehr plakette */
                    <>
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}</span>
                      <div style={{ transformStyle: 'preserve-3d' }}>
                        <BundeswehrPlakette scale={scale * 0.95} isHovering={isHovering} tilt={tilt} />
                      </div>
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{numbers}</span>
                    </>
                  ) : (
                    <>
                      {/* City code */}
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}</span>
                      
                      {/* Plaketten - counter-scale to maintain aspect ratio */}
                      {(showStatePlakette || showHUPlakette) && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: `${4 * scale}px`,
                            flexShrink: 0,
                            transform: compressionRatio < 1 ? `scaleX(${1 / compressionRatio})` : undefined,
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* HU Plakette (top) - use visibility to keep space */}
                          <div style={{ visibility: showHUPlakette ? 'visible' : 'hidden', height: showHUPlakette || showStatePlakette ? undefined : 0 }}>
                            <HUPlakette year={huYear} month={huMonth} scale={scale * 0.8} />
                          </div>
                          {/* State Plakette (bottom) */}
                          {showStatePlakette && (
                            <StatePlakette state={state} city={city} scale={scale * 0.95} isHovering={isHovering} tilt={tilt} />
                          )}
                        </div>
                      )}
                      
                      {/* Letters and numbers */}
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{letters} {numbers}{suffix}</span>
                    </>
                  )}
                </>
              ) : (
                <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{plateText || ''}</span>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }
);

LicensePlate.displayName = 'LicensePlate';

export default LicensePlate;

// Calculate minimum width for compact mode
function calculateCompactWidth(config: GermanPlateConfig): number {
  const euBandWidth = 45;
  const padding = 24; // 12px on each side
  const charWidth = 47;
  const plaketteWidth = 50;
  const gap = 16;
  
  let width = euBandWidth + padding;
  width += config.cityCode.length * charWidth;
  
  if (config.showStatePlakette || config.showHUPlakette) {
    width += plaketteWidth + gap;
  }
  
  const suffixLength = config.suffix ? 1 : 0;
  const spaceWidth = 20;
  width += (config.letters.length + config.numbers.length + suffixLength) * charWidth + spaceWidth + gap;
  
  return Math.max(width, 340);
}
