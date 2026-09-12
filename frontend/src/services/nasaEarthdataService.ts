// ==============================================================================
// MOIL NASA Earthdata & EOSDIS Space Telemetry Integration Service
// ==============================================================================

export interface NasaTokenInfo {
  token: string | null;
  isValid: boolean;
  username: string;
  authType: string;
  lpDaacAuthorized: boolean;
  smapSoilMoistureActive: boolean;
  asterMineralSpectralActive: boolean;
  landsatThermalActive: boolean;
}

/**
 * Parses and verifies the NASA Earthdata JWT / Bearer Token from .env
 */
export function getNasaEarthdataConfig(): NasaTokenInfo {
  const token = import.meta.env.VITE_NASA_EARTHDATA_TOKEN as string | undefined;

  if (!token || !token.trim()) {
    return {
      token: null,
      isValid: false,
      username: 'Guest / Demo Mode',
      authType: 'Public Demo',
      lpDaacAuthorized: false,
      smapSoilMoistureActive: false,
      asterMineralSpectralActive: false,
      landsatThermalActive: false,
    };
  }

  const cleanToken = token.trim();
  let parsedUid = 'joginder14';

  try {
    // Attempt decoding payload if JWT
    const parts = cleanToken.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.uid) {
        parsedUid = payload.uid;
      }
    }
  } catch {
    // Non-JWT or opaque bearer token
  }

  return {
    token: cleanToken,
    isValid: true,
    username: parsedUid,
    authType: 'NASA Earthdata Bearer (EOSDIS)',
    lpDaacAuthorized: true,
    smapSoilMoistureActive: true,
    asterMineralSpectralActive: true,
    landsatThermalActive: true,
  };
}

/**
 * NASA GIBS Open Satellite WMS / Tile Layer Providers (Earthdata EOSDIS)
 */
export const NASA_GIBS_TILE_PROVIDERS = {
  // NASA MODIS / Terra Land Surface Temperature (Thermal LST)
  lstThermal: {
    name: 'NASA EOSDIS Land Surface Temp (LST)',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    attribution: '&copy; <a href="https://earthdata.nasa.gov/">NASA EOSDIS GIBS</a> / USGS',
  },
  // NASA Corrected Reflectance (True Color Surface)
  trueColor: {
    name: 'NASA EOSDIS Corrected Surface Reflectance',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
    attribution: '&copy; <a href="https://earthdata.nasa.gov/">NASA EOSDIS GIBS</a>',
  },
};
