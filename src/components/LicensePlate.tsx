'use client';

import React, { forwardRef, useRef, useState, useLayoutEffect, useEffect } from 'react';
import { GermanPlateConfig, PlateStyle, GermanState, AustrianState, SwissCanton } from '@/types/plate';
import EUBand from './EUBand';
import StatePlakette from './StatePlakette';
import AustrianStatePlakette from './AustrianStatePlakette';
import HungarianCoatOfArms from './HungarianCoatOfArms';
import SlovakCoatOfArms from './SlovakCoatOfArms';
import SwissCoatOfArms from './SwissCoatOfArms';
import SwissCantonPlakette from './SwissCantonPlakette';
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
    const { cityCode, letters, numbers, suffix, showStatePlakette, showHUPlakette, state, city, huYear, huMonth, width, plateStyle, plateType, country, fontColor, backgroundColor, plateText, rightBandText, seasonalPlate } = config;
    
    const contentRef = useRef<HTMLDivElement>(null);
    const plateRef = useRef<HTMLDivElement>(null);
    const [compressionRatio, setCompressionRatio] = useState(1);
    const [dynamicPlateWidth, setDynamicPlateWidth] = useState<number | null>(null);
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
    
    // Wait for fonts to load
    useEffect(() => {
      if (typeof document !== 'undefined' && document.fonts) {
        const fontPromises = [
          document.fonts.load('105px EuroPlate'),
          document.fonts.load('105px "Google Sans"'),
          document.fonts.load('105px Tratex')
        ];
        
        Promise.all(fontPromises).then(() => {
          setFontLoaded(true);
        });
        
        document.fonts.ready.then(() => {
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
  const standardWidth = 520 * scale;
  const minCompactWidth = calculateCompactWidth(config) * scale;
  const plateWidth = width === 'standard' ? standardWidth : (dynamicPlateWidth || minCompactWidth);
    
    const isGermany = country === 'D';
    const fontSize = 105 * scale;
    const styles = getPlateStyles(plateStyle, scale);
    
    // Get country-specific features (visual elements, not colors)
    const countryFeatures = getCountryFeatures(country);
    // Colors come directly from config (set by PlateGenerator on country change)
    const textColor = fontColor;
    const plateBgColor = backgroundColor;
    const redStripeHeight = 2 * scale;
    
    // Available width for content (after EU band, borders, padding, and right band if present)
    // Switzerland (CH) has no EU band
    const effectiveEuBandWidth = country === 'CH' ? 0 : euBandWidth;
    const rightBandWidth = countryFeatures.hasRightBand ? euBandWidth : 0;
    const seasonalPlateWidth = (isGermany && seasonalPlate) ? 37 * scale : 0; // Reserve space for seasonal numbers
    const availableWidth = plateWidth - effectiveEuBandWidth - rightBandWidth - seasonalPlateWidth - (borderWidth * 2) - (padding * 2);
    
    // Create a content key that changes when content changes - forces remeasurement
    const contentKey = `${cityCode}-${letters}-${numbers}-${suffix}-${showStatePlakette}-${showHUPlakette}-${plateText}-${plateType}-${country}-${seasonalPlate?.startMonth}-${seasonalPlate?.endMonth}`;
    
  // Measure content and calculate compression/width after render AND after font loads
  useLayoutEffect(() => {
    if (contentRef.current && fontLoaded) {
      const el = contentRef.current;
      const originalTransform = el.style.transform;
      
      // Remove transform to measure natural width
      el.style.transform = 'none';
      
      // Force synchronous reflow
      void el.offsetWidth;
      const contentWidth = el.scrollWidth;
      
      if (width === 'compact') {
        // Compact mode: Expand plate to fit content, but max 520mm
        const rightBandWidth = countryFeatures.hasRightBand ? euBandWidth : 0;
        const seasonalPlateWidth = (isGermany && seasonalPlate) ? 37 * scale : 0;
        const requiredWidth = effectiveEuBandWidth + rightBandWidth + seasonalPlateWidth + (borderWidth * 2) + (padding * 2) + contentWidth;
        const maxWidth = 520 * scale;
        
        if (requiredWidth <= maxWidth) {
          // Fits within max width - no compression needed
          setDynamicPlateWidth(Math.max(requiredWidth, minCompactWidth));
          setCompressionRatio(1);
          el.style.transform = 'none';
        } else {
          // Exceeds max width - set to max and compress
          setDynamicPlateWidth(maxWidth);
          const ratio = availableWidth / contentWidth;
          const newRatio = Math.max(0.65, ratio);
          setCompressionRatio(newRatio);
          el.style.transform = `scaleX(${newRatio})`;
        }
      } else {
        // Standard mode: Fixed width, compress if needed
        if (contentWidth > availableWidth) {
          const ratio = availableWidth / contentWidth;
          const newRatio = Math.max(0.65, ratio);
          setCompressionRatio(newRatio);
          el.style.transform = `scaleX(${newRatio})`;
        } else {
          setCompressionRatio(1);
          el.style.transform = originalTransform;
        }
      }
    }
  }, [contentKey, availableWidth, scale, fontLoaded, width, euBandWidth, effectiveEuBandWidth, borderWidth, padding, isGermany, seasonalPlate, minCompactWidth, countryFeatures.hasRightBand]);
    
    const baseTextStyle: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      fontWeight: 'normal',
      letterSpacing: `${2 * scale}px`,
      whiteSpace: 'nowrap',
      fontFamily: country === 'S' ? 'Tratex, Normal' : 'EuroPlate, sans-serif',
    };
    
    // Carbon fiber pattern - woven checkerboard
    const patternSize = 8 * scale;
    const lineSize = 2 * scale;
    const halfPattern = patternSize / 2;
    
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
              linear-gradient(27deg, #151515 ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(207deg, #151515 ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(27deg, #222 ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(207deg, #222 ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(90deg, #1b1b1b ${halfPattern}px, transparent ${halfPattern}px),
              linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424)
            `
            : `
              linear-gradient(27deg, #0a0a0a ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(207deg, #0a0a0a ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(27deg, #151515 ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(207deg, #151515 ${lineSize}px, transparent ${lineSize}px),
              linear-gradient(90deg, #0e0e0e ${halfPattern}px, transparent ${halfPattern}px),
              linear-gradient(#0f0f0f 25%, #0a0a0a 25%, #0a0a0a 50%, transparent 50%, transparent 75%, #121212 75%, #121212)
            `,
          backgroundSize: styles.isGlossy 
            ? `100% 100%, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px`
            : `${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px, ${patternSize}px ${patternSize}px`,
          backgroundPosition: styles.isGlossy
            ? `0 0, 0 ${lineSize}px, ${halfPattern}px 0px, 0px ${halfPattern}px, ${halfPattern}px ${lineSize}px, 0 0, 0 0`
            : `0 ${lineSize}px, ${halfPattern}px 0px, 0px ${halfPattern}px, ${halfPattern}px ${lineSize}px, 0 0, 0 0`,
          backgroundColor: styles.isGlossy ? '#131313' : '#080808',
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
              border: `${borderWidth}px solid ${country === 'A' ? 'transparent' : styles.borderColor}`,
              borderRadius: `${8 * scale}px`,
              fontFamily: country === 'S' ? 'Tratex, Normal' : 'EuroPlate, sans-serif',
              transformStyle: 'preserve-3d',
              overflow: 'hidden',
              boxShadow: styles.is3D 
                ? `inset ${2 * scale}px ${2 * scale}px ${4 * scale}px rgba(255,255,255,0.5), inset ${-1 * scale}px ${-1 * scale}px ${3 * scale}px rgba(0,0,0,0.15)` 
                : 'none',
            }}
          >
          {/* Austrian red stripes - double stripes top and bottom, full width */}
          {countryFeatures.hasRedStripes && (
            <>
              {/* Top stripes - spacing equals stripe height */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: `${redStripeHeight}px`,
                backgroundColor: '#C8102E',
                zIndex: 0,
              }} />
              <div style={{
                position: 'absolute',
                top: `${redStripeHeight * 2}px`,
                left: 0,
                right: 0,
                height: `${redStripeHeight}px`,
                backgroundColor: '#C8102E',
                zIndex: 0,
              }} />
              {/* Bottom stripes - spacing equals stripe height */}
              <div style={{
                position: 'absolute',
                bottom: `${redStripeHeight * 2}px`,
                left: 0,
                right: 0,
                height: `${redStripeHeight}px`,
                backgroundColor: '#C8102E',
                zIndex: 0,
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${redStripeHeight}px`,
                backgroundColor: '#C8102E',
                zIndex: 0,
              }} />
            </>
          )}
          
          {/* EU Band or German Flag for military - not shown for Switzerland */}
          {country === 'CH' ? null : country === 'D' && cityCode === 'Y' ? (
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
              zIndex: 2,
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
            <div style={{
              position: 'absolute',
              left: 0,
              top: country === 'A' ? `${redStripeHeight * 3}px` : 0,
              bottom: country === 'A' ? `${redStripeHeight * 3}px` : 0,
              width: `${euBandWidth}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: country === 'A' ? `0 ${3 * scale}px` : '0',
              zIndex: 2,
            }}>
              <EUBand scale={scale} countryCode={country} height={country === 'A' ? '100%' : undefined} noBorderRadius={country === 'A'} showDinGepruft={isGermany} />
            </div>
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
              left: country === 'CH' ? 0 : `${euBandWidth}px`,
              right: countryFeatures.hasRightBand ? `${euBandWidth}px` : 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `0 ${padding}px`,
              paddingRight: seasonalPlate && isGermany ? `${seasonalPlateWidth + padding}px` : `${padding}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Scalable content wrapper */}
            <div
              ref={contentRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${6 * scale}px`,
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
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{numbers}{suffix}</span>
                    </>
                  ) : (
                    <>
                      {/* City code */}
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}{/^\d+$/.test(cityCode) ? '\u200A' : ''}</span>
                      
                      {/* Plaketten - counter-scale to maintain aspect ratio */}
                      {(showStatePlakette || showHUPlakette) && (
                        <div
                          style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: /^\d+$/.test(cityCode) ? `${14 * scale}px` : `${4 * scale}px`,
                            flexShrink: 0,
                            transform: compressionRatio < 1 ? `scaleX(${1 / compressionRatio})` : undefined,
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* HU Plakette (top) - use visibility to keep space */}
                          <div style={{ visibility: showHUPlakette ? 'visible' : 'hidden', height: showHUPlakette || showStatePlakette ? undefined : 0 }}>
                            <HUPlakette year={huYear} month={huMonth} scale={scale * 0.8} />
                          </div>
                          {/* Horizontal line for diplomatic plates (when cityCode is a number) - absolutely positioned */}
                          {/^\d+$/.test(cityCode) && showStatePlakette && (
                            <span style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%) translateZ(15px)',
                              ...textStyle,
                              fontSize: `${fontSize}px`,
                              lineHeight: 1,
                              transformStyle: 'preserve-3d',
                            }}>-</span>
                          )}
                          {/* State Plakette (bottom) */}
                          {showStatePlakette && country === 'D' && (
                            <StatePlakette state={state as GermanState} city={city} scale={scale * 0.95} isHovering={isHovering} tilt={tilt} />
                          )}
                        </div>
                      )}
                      
                      {/* Letters and numbers */}
                      <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{letters}{'\u200A'}{numbers}{suffix}</span>
                    </>
                  )}
                </>
              ) : country === 'A' ? (
                /* Austrian format with Bundesland plakette */
                <>
                  {/* City code */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}</span>
                  
                  {/* Austrian Bundesland Plakette - plain emblem */}
                  {showStatePlakette && country === 'A' && (
                    <div style={{ transformStyle: 'preserve-3d' }}>
                      <AustrianStatePlakette state={state as AustrianState} scale={scale * 1.3} />
                    </div>
                  )}
                  
                  {/* Free text for Austria */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{plateText || ''}</span>
                </>
              ) : country === 'H' ? (
                /* Hungarian format with national coat of arms */
                <>
                  {/* City code */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}</span>
                  
                  {/* Hungarian national coat of arms */}
                  {showStatePlakette && (
                    <div style={{ transformStyle: 'preserve-3d' }}>
                      <HungarianCoatOfArms scale={scale * 1.3} />
                    </div>
                  )}
                  
                  {/* Free text for Hungary */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{plateText || ''}</span>
                </>
              ) : country === 'SK' ? (
                /* Slovak format with national coat of arms */
                <>
                  {/* District code */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}</span>
                  
                  {/* Slovak national coat of arms */}
                  {showStatePlakette && (
                    <div style={{ transformStyle: 'preserve-3d' }}>
                      <SlovakCoatOfArms scale={scale * 1.3} />
                    </div>
                  )}
                  
                  {/* Free text for Slovakia */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{plateText || ''}</span>
                </>
              ) : country === 'CH' ? (
                /* Swiss format with Swiss coat of arms and canton plakette */
                <>
                  {/* Swiss coat of arms (left side) */}
                  {showStatePlakette && (
                    <div style={{ transformStyle: 'preserve-3d' }}>
                      <SwissCoatOfArms scale={scale * 1.15} />
                    </div>
                  )}
                  
                  {/* Canton code + dot + Number */}
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{cityCode}</span>
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d', fontSize: `${fontSize * 0.6}px`, margin: `0 ${2 * scale}px`, alignSelf: 'center' }}>•</span>
                  <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>{numbers}</span>
                  
                  {/* Canton coat of arms (right side) */}
                  {showStatePlakette && state && (
                    <div style={{ transformStyle: 'preserve-3d' }}>
                      <SwissCantonPlakette canton={state as SwissCanton} scale={scale * 1.15} />
                    </div>
                  )}
                </>
              ) : (
                <span style={{ ...textStyle, transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>
                  {country === 'S' ? (
                    plateType === 'normal' ? `${plateText.slice(0, 3)}\u2009${plateText.slice(3, 6)}` : plateText
                  ) : (plateText || '')}
                </span>
              )}
            </div>
          </div>
          
          {/* Seasonal plate indicators - absolute positioned at right edge */}
          {isGermany && seasonalPlate && (
            <div style={{
              position: 'absolute',
              right: `${padding}px`,
              top: '50%',
              transform: 'translateY(-50%) translateZ(15px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: `${28 * scale}px`,
              fontFamily: 'EuroPlate, sans-serif',
              fontWeight: 'normal',
              color: textColor,
              lineHeight: 1,
              transformStyle: 'preserve-3d',
              textShadow: styles.textShadow,
            }}>
              <span style={{ letterSpacing: `${1 * scale}px` }}>{String(seasonalPlate.startMonth).padStart(2, '0')}</span>
              <div style={{
                width: `${20 * scale}px`,
                height: `${2 * scale}px`,
                backgroundColor: textColor,
                margin: `${2 * scale}px 0`,
              }} />
              <span style={{ letterSpacing: `${1 * scale}px` }}>{String(seasonalPlate.endMonth).padStart(2, '0')}</span>
            </div>
          )}
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
  const charWidth = 42;
  const plaketteWidth = 45;
  const seasonalWidth = 37; // Width for seasonal plate numbers
  const gap = 10;
  
  let width = euBandWidth + padding;
  width += config.cityCode.length * charWidth;
  
  if (config.showStatePlakette || config.showHUPlakette) {
    width += plaketteWidth + gap;
  }
  
  const suffixLength = config.suffix ? 1 : 0;
  const spaceWidth = 18;
  width += (config.letters.length + config.numbers.length + suffixLength) * charWidth + spaceWidth + gap;
  
  // Add space for seasonal plate if present
  if (config.seasonalPlate) {
    width += seasonalWidth;
  }
  
  return Math.max(width, 340);
}
