/**
 * ThoughtStream Map - Geographic Vector Data & Coordinate Engine
 *
 * Equirectangular WGS84 projection coordinates:
 * Width: 1000, Height: 500
 * Longitude: -180° to +180° (X: 0 to 1000)
 * Latitude: +90° to -90° (Y: 0 to 500)
 */

export interface GeoRegion {
  id: string;
  code: string;
  name: string;
  continent: string;
  path: string;
  center: [number, number]; // [lat, lng]
}

export interface CityHub {
  id: string;
  name: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
}

/**
 * Converts Latitude and Longitude to SVG map coordinates (0..width, 0..height)
 */
export function latLngToPoint(
  lat: number,
  lng: number,
  width: number = 1000,
  height: number = 500
): { x: number; y: number } {
  // Clamp lat/lng
  const clampedLat = Math.max(-90, Math.min(90, lat));
  const clampedLng = Math.max(-180, Math.min(180, lng));

  const x = ((clampedLng + 180) / 360) * width;
  const y = ((90 - clampedLat) / 180) * height;

  return { x, y };
}

/**
 * Converts SVG map coordinates back into Latitude and Longitude
 */
export function pointToLatLng(
  x: number,
  y: number,
  width: number = 1000,
  height: number = 500
): { lat: number; lng: number } {
  const lng = (x / width) * 360 - 180;
  const lat = 90 - (y / height) * 180;

  return {
    lat: Math.round(lat * 1000) / 1000,
    lng: Math.round(lng * 1000) / 1000,
  };
}

/**
 * Formats coordinates into high-precision editorial telemetry format:
 * e.g., "51° 30' 26" N, 000° 07' 39" W"
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = Math.floor(((absLat - latDeg) * 60 - latMin) * 60);

  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = Math.floor(((absLng - lngDeg) * 60 - lngMin) * 60);

  const pad = (n: number, width: number = 2) => n.toString().padStart(width, '0');

  return `${pad(latDeg)}° ${pad(latMin)}' ${pad(latSec)}" ${latDir}, ${pad(lngDeg, 3)}° ${pad(lngMin)}' ${pad(lngSec)}" ${lngDir}`;
}

/**
 * Major Global Cities with Precise Coordinates
 */
export const GLOBAL_CITIES: CityHub[] = [
  { id: 'nyc', name: 'New York', country: 'United States', continent: 'NA', lat: 40.7128, lng: -74.006 },
  { id: 'sfo', name: 'San Francisco', country: 'United States', continent: 'NA', lat: 37.7749, lng: -122.4194 },
  { id: 'lon', name: 'London', country: 'United Kingdom', continent: 'EU', lat: 51.5074, lng: -0.1278 },
  { id: 'par', name: 'Paris', country: 'France', continent: 'EU', lat: 48.8566, lng: 2.3522 },
  { id: 'ber', name: 'Berlin', country: 'Germany', continent: 'EU', lat: 52.52, lng: 13.405 },
  { id: 'tok', name: 'Tokyo', country: 'Japan', continent: 'AS', lat: 35.6762, lng: 139.6503 },
  { id: 'sin', name: 'Singapore', country: 'Singapore', continent: 'AS', lat: 1.3521, lng: 103.8198 },
  { id: 'del', name: 'New Delhi', country: 'India', continent: 'AS', lat: 28.6139, lng: 77.209 },
  { id: 'syd', name: 'Sydney', country: 'Australia', continent: 'OC', lat: -33.8688, lng: 151.2093 },
  { id: 'dxb', name: 'Dubai', country: 'United Arab Emirates', continent: 'AS', lat: 25.2048, lng: 55.2708 },
  { id: 'sao', name: 'São Paulo', country: 'Brazil', continent: 'SA', lat: -23.5505, lng: -46.6333 },
  { id: 'cpt', name: 'Cape Town', country: 'South Africa', continent: 'AF', lat: -33.9249, lng: 18.4241 },
  { id: 'cai', name: 'Cairo', country: 'Egypt', continent: 'AF', lat: 30.0444, lng: 31.2357 },
  { id: 'tor', name: 'Toronto', country: 'Canada', continent: 'NA', lat: 43.6532, lng: -79.3832 },
  { id: 'seo', name: 'Seoul', country: 'South Korea', continent: 'AS', lat: 37.5665, lng: 126.978 },
  { id: 'hkg', name: 'Hong Kong', country: 'Hong Kong', continent: 'AS', lat: 22.3193, lng: 114.1694 },
  { id: 'rek', name: 'Reykjavik', country: 'Iceland', continent: 'EU', lat: 64.1466, lng: -21.9426 },
  { id: 'nbo', name: 'Nairobi', country: 'Kenya', continent: 'AF', lat: -1.2921, lng: 36.8219 },
];

/**
 * World Region Camera Presets (center Lat/Lng and initial zoom factor)
 */
export const MAP_CAMERA_PRESETS: Record<
  string,
  { label: string; lat: number; lng: number; zoom: number }
> = {
  world: { label: 'World View', lat: 18, lng: 10, zoom: 1 },
  'north-america': { label: 'North America', lat: 48, lng: -100, zoom: 2.1 },
  'south-america': { label: 'South America', lat: -18, lng: -60, zoom: 2.2 },
  europe: { label: 'Europe', lat: 54, lng: 15, zoom: 3.4 },
  'asia-pacific': { label: 'Asia-Pacific', lat: 28, lng: 105, zoom: 2.2 },
  africa: { label: 'Africa', lat: 2, lng: 22, zoom: 2.1 },
  oceania: { label: 'Oceania', lat: -25, lng: 135, zoom: 2.6 },
  'middle-east': { label: 'Middle East', lat: 27, lng: 48, zoom: 3.2 },
};

/**
 * Accurate, High-Fidelity SVG Paths for Global Landmasses and Regions
 * Drawn in 1000x500 Equirectangular Projection space.
 */
export const WORLD_REGIONS: GeoRegion[] = [
  // ================= NORTH AMERICA =================
  {
    id: 'na-canada',
    code: 'CA',
    name: 'Canada & Arctic',
    continent: 'NA',
    center: [60, -96],
    path: `
      M 95 62
      L 142 58 L 195 65 L 245 52 L 280 62 L 315 50 L 332 75 L 305 105
      L 330 115 L 315 130 L 290 120 L 275 140 L 260 135 L 245 155 L 210 152
      L 190 148 L 170 152 L 145 150 L 125 148 L 105 152 L 85 150 L 72 135
      L 85 110 L 75 90 L 95 62 Z
      M 260 35 L 340 32 L 355 70 L 320 85 L 285 75 L 260 35 Z
      M 190 42 L 230 38 L 225 55 L 185 52 Z
    `,
  },
  {
    id: 'na-usa',
    code: 'US',
    name: 'United States',
    continent: 'NA',
    center: [38, -97],
    path: `
      M 70 148
      L 105 150 L 145 150 L 170 152 L 210 152 L 245 155 L 260 160 L 295 140
      L 310 170 L 285 195 L 275 220 L 255 210 L 235 220 L 225 200 L 195 215
      L 155 210 L 140 195 L 115 205 L 90 190 L 72 165 L 70 148 Z
      M 25 75 L 65 72 L 72 110 L 45 125 L 20 100 Z
    `,
  },
  {
    id: 'na-greenland',
    code: 'GL',
    name: 'Greenland',
    continent: 'NA',
    center: [72, -40],
    path: `
      M 345 35
      L 415 30 L 440 65 L 420 110 L 390 125 L 370 100 L 350 80 L 345 35 Z
    `,
  },
  {
    id: 'na-mexico',
    code: 'MX',
    name: 'Mexico & Central America',
    continent: 'NA',
    center: [23, -102],
    path: `
      M 115 205
      L 155 210 L 195 215 L 225 200 L 235 220 L 220 245 L 235 260 L 245 250
      L 255 265 L 240 275 L 220 270 L 200 255 L 175 240 L 150 245 L 130 225 L 115 205 Z
      M 255 265 L 275 285 L 265 292 L 250 278 Z
      M 285 240 L 315 245 L 320 255 L 285 248 Z
    `,
  },

  // ================= SOUTH AMERICA =================
  {
    id: 'sa-brazil',
    code: 'BR',
    name: 'Brazil & Eastern Amazon',
    continent: 'SA',
    center: [-10, -52],
    path: `
      M 310 275
      L 345 265 L 385 285 L 405 320 L 385 365 L 355 375 L 330 355 L 315 330
      L 295 315 L 305 290 L 310 275 Z
    `,
  },
  {
    id: 'sa-north-west',
    code: 'CO',
    name: 'Northern & Andean Americas',
    continent: 'SA',
    center: [4, -73],
    path: `
      M 270 285
      L 305 270 L 330 272 L 310 295 L 295 315 L 285 340 L 270 345 L 260 320
      L 262 295 L 270 285 Z
    `,
  },
  {
    id: 'sa-southern-cone',
    code: 'AR',
    name: 'Argentina, Chile & Patagonia',
    continent: 'SA',
    center: [-35, -65],
    path: `
      M 285 340
      L 315 330 L 330 355 L 325 385 L 310 420 L 290 455 L 278 460 L 275 425
      L 278 375 L 285 340 Z
    `,
  },

  // ================= EUROPE =================
  {
    id: 'eu-west',
    code: 'WE',
    name: 'Western Europe',
    continent: 'EU',
    center: [47, 3],
    path: `
      M 470 120
      L 505 110 L 525 125 L 535 155 L 510 170 L 485 185 L 465 190 L 450 175
      L 460 145 L 470 120 Z
      M 485 185 L 515 200 L 505 215 L 480 205 Z
      M 445 185 L 465 190 L 455 210 L 435 205 Z
    `,
  },
  {
    id: 'eu-nordics',
    code: 'NO',
    name: 'Nordics & Scandinavia',
    continent: 'EU',
    center: [62, 15],
    path: `
      M 515 70
      L 550 65 L 575 80 L 565 115 L 535 125 L 520 110 L 515 70 Z
    `,
  },
  {
    id: 'eu-british-isles',
    code: 'GB',
    name: 'British Isles',
    continent: 'EU',
    center: [55, -3],
    path: `
      M 475 110
      L 495 105 L 490 140 L 470 145 L 475 110 Z
      M 458 120 L 470 118 L 468 135 L 455 132 Z
    `,
  },
  {
    id: 'eu-east',
    code: 'EE',
    name: 'Central & Eastern Europe',
    continent: 'EU',
    center: [53, 30],
    path: `
      M 535 115
      L 580 110 L 610 125 L 615 160 L 585 185 L 545 175 L 530 155 L 535 115 Z
    `,
  },

  // ================= AFRICA =================
  {
    id: 'af-north',
    code: 'NAF',
    name: 'North Africa & Sahara',
    continent: 'AF',
    center: [26, 17],
    path: `
      M 450 205
      L 520 195 L 595 205 L 620 225 L 605 260 L 540 265 L 480 270 L 440 250
      L 450 205 Z
    `,
  },
  {
    id: 'af-west',
    code: 'WAF',
    name: 'West Africa',
    continent: 'AF',
    center: [10, 0],
    path: `
      M 440 250
      L 480 270 L 525 265 L 530 300 L 485 305 L 450 290 L 435 265 Z
    `,
  },
  {
    id: 'af-central-east',
    code: 'EAF',
    name: 'Central & East Africa',
    continent: 'AF',
    center: [0, 32],
    path: `
      M 525 265
      L 605 260 L 640 275 L 635 315 L 600 350 L 555 350 L 530 300 Z
    `,
  },
  {
    id: 'af-south',
    code: 'SAF',
    name: 'Southern Africa & Madagascar',
    continent: 'AF',
    center: [-24, 25],
    path: `
      M 535 345
      L 580 345 L 605 375 L 585 415 L 555 425 L 535 385 Z
      M 625 355 L 640 350 L 650 395 L 635 405 Z
    `,
  },

  // ================= ASIA =================
  {
    id: 'as-russia',
    code: 'RU',
    name: 'Northern Asia & Siberia',
    continent: 'AS',
    center: [60, 95],
    path: `
      M 585 70
      L 680 62 L 780 65 L 880 75 L 945 90 L 890 125 L 810 130 L 740 135
      L 660 135 L 605 125 L 585 70 Z
    `,
  },
  {
    id: 'as-middle-east',
    code: 'ME',
    name: 'Middle East & Arabia',
    continent: 'AS',
    center: [25, 45],
    path: `
      M 595 205
      L 645 200 L 675 220 L 685 255 L 645 270 L 620 245 Z
    `,
  },
  {
    id: 'as-central',
    code: 'CAS',
    name: 'Central Asia',
    continent: 'AS',
    center: [43, 65],
    path: `
      M 615 135
      L 680 135 L 720 155 L 705 195 L 645 200 L 620 165 Z
    `,
  },
  {
    id: 'as-south-india',
    code: 'IN',
    name: 'South Asia & Indian Subcontinent',
    continent: 'AS',
    center: [20, 78],
    path: `
      M 675 210
      L 730 200 L 760 225 L 735 275 L 710 295 L 690 265 L 675 210 Z
      M 720 300 L 730 298 L 730 312 L 722 310 Z
    `,
  },
  {
    id: 'as-east-china',
    code: 'CN',
    name: 'East Asia & China',
    continent: 'AS',
    center: [35, 105],
    path: `
      M 720 155
      L 810 145 L 850 165 L 855 205 L 830 240 L 785 245 L 755 225 L 720 185 Z
    `,
  },
  {
    id: 'as-japan-korea',
    code: 'JP',
    name: 'Japan & Korea',
    continent: 'AS',
    center: [37, 137],
    path: `
      M 855 185
      L 870 180 L 865 205 L 852 200 Z
      M 875 165 L 905 180 L 895 215 L 872 205 Z
    `,
  },
  {
    id: 'as-southeast',
    code: 'SEA',
    name: 'Southeast Asia & Maritime Archipelagos',
    continent: 'AS',
    center: [8, 115],
    path: `
      M 785 245
      L 820 245 L 830 280 L 795 295 L 780 270 Z
      M 800 310 L 850 305 L 875 320 L 840 330 Z
      M 860 250 L 880 245 L 875 275 L 855 265 Z
      M 885 305 L 920 300 L 925 325 L 895 325 Z
    `,
  },

  // ================= OCEANIA =================
  {
    id: 'oc-australia',
    code: 'AU',
    name: 'Australia & New Zealand',
    continent: 'OC',
    center: [-25, 135],
    path: `
      M 830 365
      L 895 350 L 935 375 L 920 425 L 875 440 L 835 415 L 825 385 Z
      M 885 448 L 900 445 L 895 460 L 882 458 Z
      M 945 425 L 965 420 L 955 455 L 940 445 Z
      M 925 325 L 950 320 L 955 340 L 930 340 Z
    `,
  },

  // ================= ANTARCTICA =================
  {
    id: 'an-antarctica',
    code: 'AQ',
    name: 'Antarctica',
    continent: 'AN',
    center: [-80, 0],
    path: `
      M 180 475
      L 310 465 L 460 460 L 610 462 L 760 468 L 910 472 L 980 485
      L 980 500 L 20 500 L 20 485 L 180 475 Z
    `,
  },
];
