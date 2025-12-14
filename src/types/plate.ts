export type PlateWidth = 'compact' | 'standard';
export type PlateSuffix = '' | 'E' | 'H';  // E = Elektro, H = Historisch (Oldtimer)
export type PlateStyle = 'normal' | '3d-black-matte' | '3d-black-glossy' | '3d-carbon-matte' | '3d-carbon-glossy';
export type PlateType = 'normal' | 'personalized';

// Seasonal plate months (1-12)
export interface SeasonalPlate {
  startMonth: number;  // 1-12
  endMonth: number;    // 1-12
}

export const PLATE_STYLE_NAMES: Record<PlateStyle, string> = {
  'normal': 'Normal (Standard)',
  '3d-black-matte': '3D Schwarz Matt',
  '3d-black-glossy': '3D Schwarz Glänzend',
  '3d-carbon-matte': '3D Carbon Matt',
  '3d-carbon-glossy': '3D Carbon Glänzend',
};

// EU Countries + Switzerland
export type EUCountry = 
  | 'D'   // Germany
  | 'A'   // Austria
  | 'B'   // Belgium
  | 'BG'  // Bulgaria
  | 'CH'  // Switzerland
  | 'HR'  // Croatia
  | 'CY'  // Cyprus
  | 'CZ'  // Czech Republic
  | 'DK'  // Denmark
  | 'EST' // Estonia
  | 'FIN' // Finland
  | 'F'   // France
  | 'GR'  // Greece
  | 'H'   // Hungary
  | 'IRL' // Ireland
  | 'I'   // Italy
  | 'LV'  // Latvia
  | 'LT'  // Lithuania
  | 'L'   // Luxembourg
  | 'M'   // Malta
  | 'NL'  // Netherlands
  | 'PL'  // Poland
  | 'P'   // Portugal
  | 'RO'  // Romania
  | 'SK'  // Slovakia
  | 'SLO' // Slovenia
  | 'E'   // Spain
  | 'S';  // Sweden

export const EU_COUNTRY_NAMES: Record<EUCountry, string> = {
  'D': 'Deutschland',
  'A': 'Österreich',
  'B': 'Belgien',
  'BG': 'Bulgarien',
  'CH': 'Schweiz',
  'HR': 'Kroatien',
  'CY': 'Zypern',
  'CZ': 'Tschechien',
  'DK': 'Dänemark',
  'EST': 'Estland',
  'FIN': 'Finnland',
  'F': 'Frankreich',
  'GR': 'Griechenland',
  'H': 'Ungarn',
  'IRL': 'Irland',
  'I': 'Italien',
  'LV': 'Lettland',
  'LT': 'Litauen',
  'L': 'Luxemburg',
  'M': 'Malta',
  'NL': 'Niederlande',
  'PL': 'Polen',
  'P': 'Portugal',
  'RO': 'Rumänien',
  'SK': 'Slowakei',
  'SLO': 'Slowenien',
  'E': 'Spanien',
  'S': 'Schweden',
};

export interface PlateConfig {
  // Common settings for all countries
  country: EUCountry;
  width: PlateWidth;
  plateStyle: PlateStyle;
  plateType: PlateType;
  fontColor: string;       // Hex color for text
  backgroundColor: string; // Hex color for plate background
  plateText: string;       // Generic plate text for non-German plates
  rightBandText: string;   // Text for right band (France, Italy, Portugal)
  
  // German-specific settings
  cityCode: string;        // e.g., "M", "B", "HH" or "Y" for military (auto-detected)
  letters: string;         // e.g., "AB" (empty for military Y plates)
  numbers: string;         // e.g., "1234" or "123456" for military
  suffix: PlateSuffix;     // E for electric, H for historic
  showStatePlakette: boolean;
  showHUPlakette: boolean;
  state: GermanState | AustrianState | HungarianState | SlovakState | SwissCanton;  // State/Bundesland for Germany, Austria, Canton for Switzerland, or national emblem for Hungary/Slovakia
  city: string;            // City name shown on state plakette
  huYear: number;          // Year for HU sticker
  huMonth: number;         // Month for HU sticker (1-12)
  seasonalPlate: SeasonalPlate | null;  // Seasonal plate months (null = not seasonal)
}

// Keep GermanPlateConfig for backward compatibility
export type GermanPlateConfig = PlateConfig;

export type HungarianState = 'HU';  // Hungary - only national coat of arms
export type SlovakState = 'SK';     // Slovakia - only national coat of arms

export type AustrianState =
  | 'W'   // Wien
  | 'N'   // Niederösterreich
  | 'O'   // Oberösterreich
  | 'B'   // Burgenland
  | 'ST'  // Steiermark
  | 'K'   // Kärnten
  | 'S'   // Salzburg
  | 'T'   // Tirol
  | 'V';  // Vorarlberg

export type GermanState =
  | 'BW'   // Baden-Württemberg
  | 'BY'   // Bayern
  | 'BE'   // Berlin
  | 'BB'   // Brandenburg
  | 'HB'   // Bremen
  | 'HH'   // Hamburg
  | 'HE'   // Hessen
  | 'MV'   // Mecklenburg-Vorpommern
  | 'NI'   // Niedersachsen
  | 'NW'   // Nordrhein-Westfalen
  | 'RP'   // Rheinland-Pfalz
  | 'SL'   // Saarland
  | 'SN'   // Sachsen
  | 'ST'   // Sachsen-Anhalt
  | 'SH'   // Schleswig-Holstein
  | 'TH';  // Thüringen

export const AUSTRIAN_STATE_NAMES: Record<AustrianState, string> = {
  W: 'Wien',
  N: 'Niederösterreich',
  O: 'Oberösterreich',
  B: 'Burgenland',
  ST: 'Steiermark',
  K: 'Kärnten',
  S: 'Salzburg',
  T: 'Tirol',
  V: 'Vorarlberg',
};

export const STATE_NAMES: Record<GermanState, string> = {
  BW: 'Baden-Württemberg',
  BY: 'Bayern',
  BE: 'Berlin',
  BB: 'Brandenburg',
  HB: 'Bremen',
  HH: 'Hamburg',
  HE: 'Hessen',
  MV: 'Mecklenburg-Vorpommern',
  NI: 'Niedersachsen',
  NW: 'Nordrhein-Westfalen',
  RP: 'Rheinland-Pfalz',
  SL: 'Saarland',
  SN: 'Sachsen',
  ST: 'Sachsen-Anhalt',
  SH: 'Schleswig-Holstein',
  TH: 'Thüringen',
};

// Swiss Cantons
export type SwissCanton =
  | 'AG'  // Aargau
  | 'AI'  // Appenzell Innerrhoden
  | 'AR'  // Appenzell Ausserrhoden
  | 'BE'  // Bern
  | 'BL'  // Basel-Landschaft
  | 'BS'  // Basel-Stadt
  | 'FR'  // Freiburg
  | 'GE'  // Genf
  | 'GL'  // Glarus
  | 'GR'  // Graubünden
  | 'JU'  // Jura
  | 'LU'  // Luzern
  | 'NE'  // Neuenburg
  | 'NW'  // Nidwalden
  | 'OW'  // Obwalden
  | 'SG'  // St. Gallen
  | 'SH'  // Schaffhausen
  | 'SO'  // Solothurn
  | 'SZ'  // Schwyz
  | 'TG'  // Thurgau
  | 'TI'  // Tessin
  | 'UR'  // Uri
  | 'VD'  // Waadt
  | 'VS'  // Wallis
  | 'ZG'  // Zug
  | 'ZH'; // Zürich

export const SWISS_CANTON_NAMES: Record<SwissCanton, string> = {
  AG: 'Aargau',
  AI: 'Appenzell Innerrhoden',
  AR: 'Appenzell Ausserrhoden',
  BE: 'Bern',
  BL: 'Basel-Landschaft',
  BS: 'Basel-Stadt',
  FR: 'Freiburg',
  GE: 'Genf',
  GL: 'Glarus',
  GR: 'Graubünden',
  JU: 'Jura',
  LU: 'Luzern',
  NE: 'Neuenburg',
  NW: 'Nidwalden',
  OW: 'Obwalden',
  SG: 'St. Gallen',
  SH: 'Schaffhausen',
  SO: 'Solothurn',
  SZ: 'Schwyz',
  TG: 'Thurgau',
  TI: 'Tessin',
  UR: 'Uri',
  VD: 'Waadt',
  VS: 'Wallis',
  ZG: 'Zug',
  ZH: 'Zürich',
};
