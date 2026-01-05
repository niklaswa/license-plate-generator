'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';
import { GermanPlateConfig, GermanState, STATE_NAMES, AustrianState, AUSTRIAN_STATE_NAMES, HungarianState, SlovakState, SwissCanton, SWISS_CANTON_NAMES, PlateWidth, PlateSuffix, PlateStyle, PlateType, Country, DanishVariant, DanishPlateType } from '@/types/plate';
import LicensePlate from './LicensePlate';
import { useTranslation, Language, LANGUAGE_NAMES, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES } from '@/i18n';


const CURRENT_YEAR = new Date().getFullYear();

// Country flag emojis
const COUNTRY_FLAGS: Record<Country, string> = {
  'D': '🇩🇪',
  'A': '🇦🇹',
  'B': '🇧🇪',
  'BG': '🇧🇬',
  'CH': '🇨🇭',
  'HR': '🇭🇷',
  'CY': '🇨🇾',
  'CZ': '🇨🇿',
  'DK': '🇩🇰',
  'EST': '🇪🇪',
  'FIN': '🇫🇮',
  'F': '🇫🇷',
  'GB': '🇬🇧',
  'GR': '🇬🇷',
  'H': '🇭🇺',
  'IRL': '🇮🇪',
  'I': '🇮🇹',
  'LV': '🇱🇻',
  'LT': '🇱🇹',
  'L': '🇱🇺',
  'M': '🇲🇹',
  'N': '🇳🇴',
  'NL': '🇳🇱',
  'PL': '🇵🇱',
  'P': '🇵🇹',
  'RO': '🇷🇴',
  'SK': '🇸🇰',
  'SLO': '🇸🇮',
  'E': '🇪🇸',
  'S': '🇸🇪',
  'FL': '🇱🇮',
};

// Country-specific default colors and settings
function getCountryDefaults(country: Country): { fontColor: string; backgroundColor: string; rightBandText: string } {
  switch (country) {
    // Black plates
    case 'FL': // Liechtenstein - black with white text
      return { fontColor: '#FFFFFF', backgroundColor: '#000000', rightBandText: '' };
    
    // Yellow plates
    case 'NL': // Netherlands - yellow
      return { fontColor: '#000000', backgroundColor: '#F7D117', rightBandText: '' };
    case 'L': // Luxembourg - yellow
      return { fontColor: '#000000', backgroundColor: '#FCD116', rightBandText: '' };
    case 'CY': // Cyprus - yellow
      return { fontColor: '#000000', backgroundColor: '#F4C430', rightBandText: '' };
    case 'GB': // United Kingdom - yellow (rear plate)
      return { fontColor: '#000000', backgroundColor: '#F7D117', rightBandText: '' };
    
    // Red text plates
    case 'B': // Belgium - white with red text
      return { fontColor: '#C8102E', backgroundColor: '#FFFFFF', rightBandText: '' };
    
    // Countries with right band
    case 'F': // France - right band with region code
      return { fontColor: '#000000', backgroundColor: '#FFFFFF', rightBandText: '75' };
    case 'I': // Italy - right band with region code
      return { fontColor: '#000000', backgroundColor: '#FFFFFF', rightBandText: 'RM' };
    
    // White plates with black text (default for most EU countries)
    case 'D':   // Germany
    case 'A':   // Austria (+ red stripes handled in LicensePlate)
    case 'E':   // Spain
    case 'N':   // Norway
    case 'PL':  // Poland
    case 'CZ':  // Czech Republic
    case 'SK':  // Slovakia
    case 'H':   // Hungary
    case 'RO':  // Romania
    case 'BG':  // Bulgaria
    case 'HR':  // Croatia (+ red blue stripes handled in LicensePlate)
    case 'SLO': // Slovenia
    case 'GR':  // Greece
    case 'DK':  // Denmark
    case 'S':   // Sweden
    case 'FIN': // Finland
    case 'EST': // Estonia
    case 'LV':  // Latvia
    case 'LT':  // Lithuania
    case 'IRL': // Ireland
    case 'M':   // Malta
    default:
      return { fontColor: '#000000', backgroundColor: '#FFFFFF', rightBandText: '' };
  }
}

const DEFAULT_CONFIG: GermanPlateConfig = {
  cityCode: 'N',
  letters: 'IK',
  numbers: '745',
  suffix: 'E',
  showStatePlakette: true,
  showHUPlakette: true,
  state: 'NW',
  city: 'Landeshauptstadt Düsseldorf',
  huYear: CURRENT_YEAR + 2,
  huMonth: 7,
  width: 'standard',
  plateStyle: 'normal',
  plateType: 'normal',
  country: 'D',
  fontColor: '#000000',
  backgroundColor: '#FFFFFF',
  plateText: 'NIKLAS',
  rightBandText: '',
  seasonalPlate: null,
  showUKFlag: false,
  isEV: false,
  danishVariant: 'eu',
  danishPlateType: 'type1',
};

// Parse config from URL hash
function parseConfigFromHash(): GermanPlateConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  
  const hash = window.location.hash.slice(1); // Remove leading #
  const params = new URLSearchParams(hash);
  
  const seasonalStart = params.get('seasonStart');
  const seasonalEnd = params.get('seasonEnd');
  const seasonalPlate = seasonalStart && seasonalEnd 
    ? { startMonth: parseInt(seasonalStart), endMonth: parseInt(seasonalEnd) }
    : null;

  const dkStyleParam = params.get('dkStyle');
  const dkTypeParam = params.get('dkType');
  const danishVariant: DanishVariant = dkStyleParam === 'classic' || dkStyleParam === 'eu'
    ? dkStyleParam
    : DEFAULT_CONFIG.danishVariant;
  const danishPlateType: DanishPlateType = dkTypeParam === 'type3' || dkTypeParam === 'type1'
    ? dkTypeParam
    : DEFAULT_CONFIG.danishPlateType;

  return {
    cityCode: params.get('code') || DEFAULT_CONFIG.cityCode,
    letters: params.get('letters') || DEFAULT_CONFIG.letters,
    numbers: params.get('numbers') || DEFAULT_CONFIG.numbers,
    suffix: (params.get('suffix') as PlateSuffix) || DEFAULT_CONFIG.suffix,
    showStatePlakette: params.get('wappen') !== '0',
    showHUPlakette: params.get('hu') !== '0',
    state: (params.get('state') as (GermanState | AustrianState)) || DEFAULT_CONFIG.state,
    city: params.get('city') || DEFAULT_CONFIG.city,
    huYear: parseInt(params.get('huYear') || String(DEFAULT_CONFIG.huYear)),
    huMonth: parseInt(params.get('huMonth') || String(DEFAULT_CONFIG.huMonth)),
    width: (params.get('width') as PlateWidth) || DEFAULT_CONFIG.width,
    plateStyle: (params.get('style') as PlateStyle) || DEFAULT_CONFIG.plateStyle,
    plateType: (params.get('plateType') as PlateType) || DEFAULT_CONFIG.plateType,
    country: (params.get('country') as Country) || DEFAULT_CONFIG.country,
    fontColor: params.get('fontColor') || DEFAULT_CONFIG.fontColor,
    backgroundColor: params.get('bgColor') || DEFAULT_CONFIG.backgroundColor,
    plateText: params.get('text') || DEFAULT_CONFIG.plateText,
    rightBandText: params.get('rightBand') || DEFAULT_CONFIG.rightBandText,
    seasonalPlate,
    showUKFlag: params.get('ukFlag') === '1',
    isEV: params.get('ev') === '1',
    danishVariant,
    danishPlateType,
  };
}

// Generate URL hash from config
function configToHash(config: GermanPlateConfig): string {
  const params = new URLSearchParams();
  params.set('code', config.cityCode);
  params.set('letters', config.letters);
  params.set('numbers', config.numbers);
  if (config.suffix) params.set('suffix', config.suffix);
  if (!config.showStatePlakette) params.set('wappen', '0');
  if (!config.showHUPlakette) params.set('hu', '0');
  params.set('state', config.state);
  params.set('city', config.city);
  params.set('huYear', String(config.huYear));
  params.set('huMonth', String(config.huMonth));
  if (config.width !== 'standard') params.set('width', config.width);
  if (config.plateStyle !== 'normal') params.set('style', config.plateStyle);
  if (config.plateType !== 'normal') params.set('plateType', config.plateType);
  if (config.country !== 'D') params.set('country', config.country);
  if (config.fontColor !== '#000000') params.set('fontColor', config.fontColor);
  if (config.backgroundColor !== '#FFFFFF') params.set('bgColor', config.backgroundColor);
  if (config.plateText) params.set('text', config.plateText);
  if (config.rightBandText) params.set('rightBand', config.rightBandText);
  if (config.seasonalPlate) {
    params.set('seasonStart', String(config.seasonalPlate.startMonth));
    params.set('seasonEnd', String(config.seasonalPlate.endMonth));
  }
  if (config.showUKFlag) params.set('ukFlag', '1');
  if (config.isEV) params.set('ev', '1');
  if (config.danishVariant !== DEFAULT_CONFIG.danishVariant) params.set('dkStyle', config.danishVariant);
  if (config.danishPlateType !== DEFAULT_CONFIG.danishPlateType) params.set('dkType', config.danishPlateType);
  return params.toString();
}

export default function PlateGenerator() {
  const { t, language, changeLanguage } = useTranslation();
  const [config, setConfig] = useState<GermanPlateConfig>(DEFAULT_CONFIG);
  const [showGermanOptions, setShowGermanOptions] = useState(true);
  const [showAustrianOptions, setShowAustrianOptions] = useState(true);
  const [showSwissOptions, setShowSwissOptions] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [plateTexture, setPlateTexture] = useState<string | null>(null);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [is3DEasterEgg, setIs3DEasterEgg] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const plateRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Check for 3D easter egg in hash
  useEffect(() => {
    const checkEasterEgg = () => {
      const hash = window.location.hash;
      setIs3DEasterEgg(hash.includes('3d-render=true'));
    };
    checkEasterEgg();
    window.addEventListener('hashchange', checkEasterEgg);
    return () => window.removeEventListener('hashchange', checkEasterEgg);
  }, []);

  // Initialize from hash on mount (client-side only)
  useEffect(() => {
    const initialConfig = parseConfigFromHash();
    setConfig(initialConfig);
    setShowGermanOptions(initialConfig.country === 'D');
    setIsInitialized(true);

    // Listen for hash changes (e.g., browser back/forward)
    const handleHashChange = () => {
      const newConfig = parseConfigFromHash();
      setConfig(newConfig);
      setShowGermanOptions(newConfig.country === 'D');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when config changes
  useEffect(() => {
    if (!isInitialized) return;
    const newHash = configToHash(config);
    // Use replaceState to avoid polluting history on every keystroke
    window.history.replaceState(null, '', `#${newHash}`);
  }, [config, isInitialized]);

  // Set country-specific defaults when country or plateType changes
  useEffect(() => {
    if (!isInitialized) return;
    setConfig(prev => {
      const newConfig = { ...prev };

      // --- ADDED: Austria Green Color Logic ---
      if (prev.country === 'A') {
        newConfig.fontColor = '#008351'; // Austrian EV Green
      } else if (prev.fontColor === '#008351') {

        newConfig.fontColor = '#000000';
      }
      // ----------------------------------------

      if (prev.country === 'S') {
        if (prev.plateType === 'normal') {
          newConfig.plateText = 'ABC123';
        }
      } else if (prev.country === 'DK') {
        if (prev.plateType === 'normal') {
          // Set default normal format for Denmark
          newConfig.plateText = 'AB12345';
        }
      } else {
        // Reset when not Sweden or Denmark
        if (prev.plateText === 'ABC123' || prev.plateText === 'AB12345') {
          newConfig.plateText = DEFAULT_CONFIG.plateText;
        }
      }
      return newConfig;
    });
  }, [config.country, config.plateType, isInitialized]);

  // Generate plate texture for 3D preview
  useEffect(() => {
    if (!plateRef.current || !show3DPreview) return;
    
    const generateTexture = async () => {
      try {
        const dataUrl = await domToPng(plateRef.current!, {
          scale: 2,
        });
        setPlateTexture(dataUrl);
      } catch (error) {
        console.debug('Failed to generate plate texture:', error);
      }
    };
    
    // Debounce texture generation
    const timeout = setTimeout(generateTexture, 300);
    return () => clearTimeout(timeout);
  }, [config, show3DPreview]);

  const handleChange = useCallback((field: keyof GermanPlateConfig, value: string | boolean | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const exportAsPNG = useCallback(async () => {
    if (!plateRef.current) return;

    console.debug('[Export] Starting export...');
    setIsExporting(true);
    
    try {
      // Get actual DOM dimensions
      const domWidth = plateRef.current.offsetWidth;
      const domHeight = plateRef.current.offsetHeight;
      console.debug('[Export] DOM dimensions:', { domWidth, domHeight });
      
      // Calculate export dimensions
      const aspectRatio = domWidth / domHeight;
      const exportWidth = 420;
      const exportHeight = Math.round(exportWidth / aspectRatio);
      console.debug('[Export] Export dimensions:', { exportWidth, exportHeight, aspectRatio });
      
      // Use modern-screenshot - Safari compatible
      // First capture at original size, then resize
      console.debug('[Export] Starting modern-screenshot conversion...');
      const fullDataUrl = await domToPng(plateRef.current, {
        scale: 3,
      });
      console.debug('[Export] Full image captured, length:', fullDataUrl.length);
      
      // Load and resize
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = fullDataUrl;
      });
      console.debug('[Export] Image loaded, resizing to 420px width...');
      
      // Create canvas at export size
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Draw resized
      ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
      const dataUrl = canvas.toDataURL('image/png');
      console.debug('[Export] Resized image ready, length:', dataUrl.length);

      // Generate filename based on country
      let baseName: string;
      switch (config.country) {
        case 'D': // Germany: cityCode + letters + numbers + suffix
          baseName = `${config.cityCode}${config.letters}${config.numbers}${config.suffix}`;
          break;
        case 'A': // Austria: cityCode + plateText
        case 'H': // Hungary: cityCode + plateText
        case 'SK': // Slovakia: cityCode + plateText
          baseName = `${config.cityCode}${config.plateText}`;
          break;
        case 'CH': // Switzerland: cityCode (canton) + numbers
          baseName = `${config.cityCode}${config.numbers}`;
          break;
        default: // Other countries: use plateText or fallback
          baseName = config.plateText || `${config.cityCode}${config.letters}${config.numbers}`;
      }
      const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
      const filename = `Plate${cleanName}.png`;
      console.debug('[Export] Generated filename:', filename);

      // Download
      console.debug('[Export] Creating download link...');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      console.debug('[Export] Triggering download...');
      link.click();
      document.body.removeChild(link);
      console.debug('[Export] Download complete!');
      
      setIsExporting(false);
    } catch (error) {
      console.debug('[Export] Export failed:', error);
      alert(t.exportFailed);
      setIsExporting(false);
    }
  }, [config, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Language Selector and Links */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/niklaswa/license-plate-generator" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a 
              href="https://ts.la/niklas82130" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-red-400/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="-38.0376 -63.1255 329.6592 378.753"><path d="M126.806 252.502l35.476-199.519c33.815 0 44.481 3.708 46.021 18.843 0 0 22.684-8.458 34.125-25.636-44.646-20.688-89.505-21.621-89.505-21.621l-26.176 31.882.059-.004-26.176-31.883s-44.86.934-89.5 21.622c11.431 17.178 34.124 25.636 34.124 25.636 1.549-15.136 12.202-18.844 45.79-18.868l35.762 199.548"/><path d="M126.792 15.36c36.09-.276 77.399 5.583 119.687 24.014 5.652-10.173 7.105-14.669 7.105-14.669C207.357 6.416 164.066.157 126.787 0 89.51.157 46.221 6.417 0 24.705c0 0 2.062 5.538 7.1 14.669 42.28-18.431 83.596-24.29 119.687-24.014h.005"/></svg>
              Tesla
            </a>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span>🌐</span>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as Language)}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-gray-800 text-white">
                  {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow-lg">
          {t.pageTitle}
        </h1>

        {/* Controls */}
        <div className="glass-card rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
            {t.configureTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t.country}
              </label>
              <select
                value={config.country}
                onChange={(e) => {
                  const newCountry = e.target.value as Country;
                  const countryDefaults = getCountryDefaults(newCountry);
                  setConfig(prev => ({
                    ...prev,
                    country: newCountry,
                    fontColor: countryDefaults.fontColor,
                    backgroundColor: countryDefaults.backgroundColor,
                    rightBandText: countryDefaults.rightBandText,
                    // Reset state to appropriate default when switching countries
                    state: newCountry === 'A' ? 'W' : newCountry === 'H' ? 'HU' : newCountry === 'SK' ? 'SK' : newCountry === 'FL' ? 'FL' : newCountry === 'HR' ? 'HR' : newCountry === 'CH' ? 'ZH' : 'NW',
                    // Reset cityCode for Swiss plates to canton code
                    cityCode: newCountry === 'CH' ? 'ZH' : prev.cityCode,
                    numbers: newCountry === 'CH' ? '123456' : prev.numbers,
                    danishVariant: newCountry === 'DK' ? DEFAULT_CONFIG.danishVariant : prev.danishVariant,
                    danishPlateType: newCountry === 'DK' ? DEFAULT_CONFIG.danishPlateType : prev.danishPlateType,
                    plateText: newCountry === 'DK' ? 'AB12345' : prev.plateText,
                  }));
                  setShowGermanOptions(newCountry === 'D');
                  setShowAustrianOptions(newCountry === 'A');
                }}
                className="modern-select"
              >
                {Object.keys(t.countries).map((code) => (
                  <option key={code} value={code}>
                    {COUNTRY_FLAGS[code as Country]} {t.countries[code as keyof typeof t.countries]} ({code})
                  </option>
                ))}
              </select>
            </div>

            {/* Plate Text - for countries without coat of arms */}
            {!['D', 'A', 'H', 'SK', 'CH', 'FL', 'HR'].includes(config.country) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {config.country === 'S' ? (config.plateType === 'normal' ? t.lettersAndNumbers : t.personalizedText)
                    : config.country === 'DK' ? (config.plateType === 'normal' ? t.lettersAndNumbers : t.personalizedText)
                    : t.plateText}
                </label>
                <input
                  type="text"
                  value={config.plateText}
                  onChange={(e) => {
                    const rawValue = e.target.value.toUpperCase();
                    if (config.country === 'DK') {
                      const sanitized = rawValue.replace(/Q/g, '').replace(/[^A-Z0-9]/g, '').slice(0, 7);
                      handleChange('plateText', sanitized);
                      return;
                    }
                    handleChange('plateText', rawValue.slice(0, config.country === 'S' ? (config.plateType === 'normal' ? 6 : 7) : undefined));
                  }}
                  className="modern-input"
                  placeholder={
                    config.country === 'S'
                      ? (config.plateType === 'normal' ? 'ABC123' : 'MYPLATE')
                      : config.country === 'DK'
                        ? (config.plateType === 'normal' ? 'AB12345' : 'ELON')
                      : 'AB 123 CD'
                  }
                  maxLength={config.country === 'S' ? (config.plateType === 'normal' ? 6 : 7) : config.country === 'DK' ? 7 : undefined}
                />
              </div>
            )}

            {/* Right band text - for France, Italy, Portugal */}
            {['F', 'I', 'P'].includes(config.country) && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {t.rightBandText || 'Region/Code'}
                </label>
                <input
                  type="text"
                  value={config.rightBandText}
                  onChange={(e) => handleChange('rightBandText', e.target.value.toUpperCase().slice(0, 3))}
                  className="modern-input"
                  maxLength={3}
                  placeholder={config.country === 'F' ? '75' : config.country === 'I' ? 'RM' : ''}
                />
              </div>
            )}

            {/* German plate inputs - City Code */}
            {config.country === 'D' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {config.cityCode === 'Y' ? '🪖 Kennbuchstabe' : t.cityCode}
                </label>
                <input
                  type="text"
                  value={config.cityCode}
                  onChange={(e) => handleChange('cityCode', e.target.value.toUpperCase().slice(0, 3))}
                  className="modern-input"
                  maxLength={3}
                  placeholder={config.cityCode === 'Y' ? "Y" : "M, B, HH..."}
                />
              </div>
            )}

            {/* Austrian plate inputs - City Code */}
            {config.country === 'A' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Bezirkskennzeichen
                </label>
                <input
                  type="text"
                  value={config.cityCode}
                  onChange={(e) => handleChange('cityCode', e.target.value.toUpperCase().slice(0, 3))}
                  className="modern-input"
                  maxLength={3}
                  placeholder="W, WU, N..."
                />
              </div>
            )}

            {/* Letters input - only for German plates */}
            {config.country === 'D' && config.cityCode !== 'Y' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {t.letters}
                </label>
                <input
                  type="text"
                  value={config.letters}
                  onChange={(e) => handleChange('letters', e.target.value.toUpperCase().slice(0, 2))}
                  className="modern-input"
                  maxLength={2}
                  placeholder="AB"
                />
              </div>
            )}

            {/* Austrian plate inputs - Free text */}
            {config.country === 'A' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Buchstaben- und Zahlenkombination
                </label>
                <input
                  type="text"
                  value={config.plateText}
                  onChange={(e) => handleChange('plateText', e.target.value.toUpperCase().slice(0, 7))}
                  className="modern-input"
                  maxLength={7}
                  placeholder="AB12345"
                />
              </div>
            )}

            {/* Croatian plate inputs - City code + Free text */}
            {config.country === 'HR' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Stadtkennzeichen
                  </label>
                  <input
                    type="text"
                    value={config.cityCode}
                    onChange={(e) => handleChange('cityCode', e.target.value.toUpperCase().slice(0, 3))}
                    className="modern-input"
                    maxLength={3}
                    placeholder="ZG, ST..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Buchstaben- und Zahlenkombination
                  </label>
                  <input
                    type="text"
                    value={config.plateText}
                    onChange={(e) => handleChange('plateText', e.target.value.toUpperCase().slice(0, 7))}
                    className="modern-input"
                    maxLength={7}
                    placeholder="ABC123"
                  />
                </div>
              </>
            )}

            {/* Hungarian plate inputs - City code + Free text */}
            {config.country === 'H' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Stadtkennzeichen
                  </label>
                  <input
                    type="text"
                    value={config.cityCode}
                    onChange={(e) => handleChange('cityCode', e.target.value.toUpperCase().slice(0, 3))}
                    className="modern-input"
                    maxLength={3}
                    placeholder="BP, DE..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Buchstaben- und Zahlenkombination
                  </label>
                  <input
                    type="text"
                    value={config.plateText}
                    onChange={(e) => handleChange('plateText', e.target.value.toUpperCase().slice(0, 7))}
                    className="modern-input"
                    maxLength={7}
                    placeholder="ABC123"
                  />
                </div>
              </>
            )}

            {/* Slovak plate inputs - City code + Free text */}
            {config.country === 'SK' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Bezirkskennzeichen
                  </label>
                  <input
                    type="text"
                    value={config.cityCode}
                    onChange={(e) => handleChange('cityCode', e.target.value.toUpperCase().slice(0, 2))}
                    className="modern-input"
                    maxLength={2}
                    placeholder="BA, KE..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Buchstaben- und Zahlenkombination
                  </label>
                  <input
                    type="text"
                    value={config.plateText}
                    onChange={(e) => handleChange('plateText', e.target.value.toUpperCase().slice(0, 7))}
                    className="modern-input"
                    maxLength={7}
                    placeholder="ABC123"
                  />
                </div>
              </>
            )}

            {/* Liechtenstein plate inputs - Free text */}
            {config.country === 'FL' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Kennzeichen
                  </label>
                  <input
                    type="text"
                    value={config.plateText}
                    onChange={(e) => handleChange('plateText', e.target.value.toUpperCase().slice(0, 6))}
                    className="modern-input"
                    maxLength={6}
                    placeholder="12345"
                  />
                </div>
              </>
            )}

            {/* Swiss plate inputs - Canton + Number */}
            {config.country === 'CH' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Kanton
                  </label>
                  <select
                    value={config.state}
                    onChange={(e) => {
                      const canton = e.target.value as SwissCanton;
                      setConfig(prev => ({
                        ...prev,
                        state: canton,
                        cityCode: canton, // Canton code is also the plate prefix
                      }));
                    }}
                    className="modern-select"
                  >
                    {Object.entries(SWISS_CANTON_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Nummer
                  </label>
                  <input
                    type="text"
                    value={config.numbers}
                    onChange={(e) => handleChange('numbers', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="modern-input"
                    maxLength={6}
                    placeholder="123456"
                  />
                </div>
              </>
            )}

            {/* Numbers input - only for German plates */}
            {config.country === 'D' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {config.cityCode === 'Y' ? 'Ziffernfolge' : t.numbers}
                </label>
                <input
                  type="text"
                  value={config.numbers}
                  onChange={(e) => handleChange('numbers', config.cityCode === 'Y' 
                    ? e.target.value.toUpperCase().slice(0, 6)
                    : e.target.value.replace(/\D/g, '').slice(0, 4)
                  )}
                  className="modern-input"
                  maxLength={config.cityCode === 'Y' ? 6 : 4}
                  placeholder={config.cityCode === 'Y' ? "12-AB4" : "1234"}
                />
              </div>
            )}

            {/* Width Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t.plateWidth}
              </label>
              <select
                value={config.width}
                onChange={(e) => handleChange('width', e.target.value as PlateWidth)}
                className="modern-select"
              >
                <option value="standard">{t.widthStandard}</option>
                <option value="compact">{t.widthCompact}</option>
              </select>
            </div>

            {/* Plate Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t.plateStyle}
              </label>
              <select
                value={config.plateStyle}
                onChange={(e) => handleChange('plateStyle', e.target.value as PlateStyle)}
                className="modern-select"
              >
                <option value="normal">{t.styleNormal}</option>
                <option value="acrylic">{t.styleAcrylic}</option>
                <option value="3d-black-glossy">{t.style3DBlack}</option>
                <option value="3d-carbon-glossy">{t.style3DCarbon}</option>
                <option value="3d-black-matte">{t.style3DBlackMatte}</option>
                <option value="3d-carbon-matte">{t.style3DCarbonMatte}</option>
              </select>
            </div>

            {/* Danish options */}
            {config.country === 'DK' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {t.danishStyle}
                  </label>
                <select
                  value={config.danishVariant}
                  onChange={(e) => handleChange('danishVariant', e.target.value as DanishVariant)}
                  className="modern-select"
                >
                  <option value="classic">{t.danishClassic}</option>
                  <option value="eu">{t.danishEuro}</option>
                </select>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {t.danishPlateType}
                  </label>
                  <select
                    value={config.danishPlateType}
                    onChange={(e) => handleChange('danishPlateType', e.target.value as DanishPlateType)}
                    className="modern-select"
                  >
                    <option value="type1">{t.danishType1}</option>
                    <option value="type3">{t.danishType3}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    {t.plateType}
                  </label>
                  <select
                    value={config.plateType}
                    onChange={(e) => handleChange('plateType', e.target.value as PlateType)}
                    className="modern-select"
                  >
                    <option value="normal">{t.plateTypeNormal}</option>
                    <option value="personalized">{t.plateTypePersonalized}</option>
                  </select>
                </div>
              </>
            )}

            {/* Plate Type Selection - only for Sweden */}
            {config.country === 'S' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {t.plateType}
                </label>
                <select
                  value={config.plateType}
                  onChange={(e) => handleChange('plateType', e.target.value as PlateType)}
                  className="modern-select"
                >
                  <option value="normal">{t.plateTypeNormal}</option>
                  <option value="personalized">{t.plateTypePersonalized}</option>
                </select>
              </div>
            )}

            {/* Font Color */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t.fontColor}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.fontColor}
                  onChange={(e) => handleChange('fontColor', e.target.value)}
                  className="w-12 h-10 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={config.fontColor}
                  onChange={(e) => handleChange('fontColor', e.target.value)}
                  className="modern-input flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t.backgroundColor}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="modern-input flex-1"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* Suffix Selection (E/H) - for Germany (including military) */}
            {config.country === 'D' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {t.suffix}
                </label>
                <select
                  value={config.suffix}
                  onChange={(e) => handleChange('suffix', e.target.value as PlateSuffix)}
                  className="modern-select"
                >
                  <option value="">Normal</option>
                  <option value="E">E (Elektro)</option>
                  <option value="H">H (Oldtimer)</option>
                </select>
              </div>
            )}

            {/* UK Options */}
            {config.country === 'GB' && (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={config.showUKFlag}
                    onChange={(e) => handleChange('showUKFlag', e.target.checked)}
                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 transition-all"
                  />
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">🇬🇧 Show UK Flag + Text</span>
                </label>
                <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={config.isEV}
                    onChange={(e) => handleChange('isEV', e.target.checked)}
                    className="w-5 h-5 rounded-lg text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 transition-all"
                  />
                  <span className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">⚡ Electric Vehicle (Green Strip)</span>
                </label>
              </div>
            )}
          </div>

          {/* German-specific options - collapsible */}
          {config.country === 'D' && config.cityCode !== 'Y' && (
            <div className="mt-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
              <button
                onClick={() => setShowGermanOptions(!showGermanOptions)}
                className="flex items-center gap-3 text-lg font-medium text-gray-800 dark:text-white mb-4 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
              >
                <span className={`transform transition-transform duration-300 ${showGermanOptions ? 'rotate-90' : ''} group-hover:text-purple-500`}>▶</span>
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🇩🇪</span>
                  {t.state} / {t.city} / Saisonkennzeichen
                </span>
              </button>
              
              {showGermanOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in slide-in-from-top-2 duration-300">
                  {/* State Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {t.state}
                    </label>
                    <select
                      value={config.state}
                      onChange={(e) => handleChange('state', e.target.value as GermanState)}
                      className="modern-select"
                    >
                      {Object.entries(STATE_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      value={config.city}
                      onChange={(e) => handleChange('city', e.target.value.slice(0, 35))}
                      className="modern-input"
                      maxLength={35}
                      placeholder="München, Düsseldorf..."
                    />
                  </div>

                  {/* HU Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {t.huYear}
                    </label>
                    <select
                      value={config.huYear}
                      onChange={(e) => handleChange('huYear', parseInt(e.target.value))}
                      className="modern-select"
                    >
                      {Array.from({ length: 21 }, (_, i) => CURRENT_YEAR - 10 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* HU Month */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {t.huMonth}
                    </label>
                    <select
                      value={config.huMonth}
                      onChange={(e) => handleChange('huMonth', parseInt(e.target.value))}
                      className="modern-select"
                    >
                      {t.months.map((monthName, index) => (
                        <option key={index + 1} value={index + 1}>
                          {monthName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={config.showStatePlakette}
                        onChange={(e) => handleChange('showStatePlakette', e.target.checked)}
                        className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 transition-all"
                      />
                      <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t.showStatePlakette}</span>
                    </label>
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={config.showHUPlakette}
                        onChange={(e) => handleChange('showHUPlakette', e.target.checked)}
                        className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 transition-all"
                      />
                      <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t.showHUPlakette}</span>
                    </label>
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={config.seasonalPlate !== null}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({ ...prev, seasonalPlate: { startMonth: 3, endMonth: 10 } }));
                          } else {
                            setConfig(prev => ({ ...prev, seasonalPlate: null }));
                          }
                        }}
                        className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 transition-all"
                      />
                      <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Saisonkennzeichen</span>
                    </label>
                  </div>

                  {/* Seasonal Plate Month Selection */}
                  {config.seasonalPlate && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                          Saison Start
                        </label>
                        <select
                          value={config.seasonalPlate.startMonth}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            seasonalPlate: prev.seasonalPlate ? { ...prev.seasonalPlate, startMonth: parseInt(e.target.value) } : null
                          }))}
                          className="modern-select"
                        >
                          {t.months.map((monthName, index) => (
                            <option key={index + 1} value={index + 1}>
                              {monthName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                          Saison Ende
                        </label>
                        <select
                          value={config.seasonalPlate.endMonth}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            seasonalPlate: prev.seasonalPlate ? { ...prev.seasonalPlate, endMonth: parseInt(e.target.value) } : null
                          }))}
                          className="modern-select"
                        >
                          {t.months.map((monthName, index) => (
                            <option key={index + 1} value={index + 1}>
                              {monthName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Austrian-specific options - collapsible */}
          {config.country === 'A' && (
            <div className="mt-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
              <button
                onClick={() => setShowAustrianOptions(!showAustrianOptions)}
                className="flex items-center gap-3 text-lg font-medium text-gray-800 dark:text-white mb-4 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
              >
                <span className={`transform transition-transform duration-300 ${showAustrianOptions ? 'rotate-90' : ''} group-hover:text-purple-500`}>▶</span>
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🇦🇹</span>
                  Bundesland
                </span>
              </button>
              
              {showAustrianOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in slide-in-from-top-2 duration-300">
                  {/* Austrian State Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Bundesland
                    </label>
                    <select
                      value={config.state}
                      onChange={(e) => handleChange('state', e.target.value as AustrianState)}
                      className="modern-select"
                    >
                      {Object.entries(AUSTRIAN_STATE_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Swiss-specific options - collapsible */}
          {config.country === 'CH' && (
            <div className="mt-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
              <button
                onClick={() => setShowSwissOptions(!showSwissOptions)}
                className="flex items-center gap-3 text-lg font-medium text-gray-800 dark:text-white mb-4 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
              >
                <span className={`transform transition-transform duration-300 ${showSwissOptions ? 'rotate-90' : ''} group-hover:text-purple-500`}>▶</span>
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🇨🇭</span>
                  Wappen anzeigen
                </span>
              </button>
              
              {showSwissOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in slide-in-from-top-2 duration-300">
                  {/* Checkbox for showing coat of arms */}
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={config.showStatePlakette}
                        onChange={(e) => handleChange('showStatePlakette', e.target.checked)}
                        className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 transition-all"
                      />
                      <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Schweizer & Kantonswappen anzeigen</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="glass-card rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
            {t.previewTitle}
          </h2>
          <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-purple-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent shadow-inner">
            <div className="flex justify-center min-w-fit">
              <LicensePlate ref={plateRef} config={config} scale={1.5} />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="text-center pb-8">
          <button
            onClick={exportAsPNG}
            disabled={isExporting}
            className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 mx-auto"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportiere...
              </>
            ) : (
              <>
                📥 {t.exportPNG}
              </>
            )}
          </button>
          <p className="mt-3 text-sm text-white/70">
            Export: 420 × dynamisch px
          </p>
        </div>

        {/* USB Installation Guide */}
        <div className="glass-card rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            {t.usbInstallTitle}
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</span>
              <p>{t.usbInstallStep1}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</span>
              <p>{t.usbInstallStep2}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</span>
              <p>{t.usbInstallStep3}</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">4</span>
              <p>{t.usbInstallStep4}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
