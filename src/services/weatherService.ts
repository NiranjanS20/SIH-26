// ==============================================================================
// MOIL Weather Telemetry Service - Real OpenWeather API Integration
// ==============================================================================

export interface LiveWeatherData {
  temp: number; // in °C
  feelsLike: number;
  humidity: number; // in %
  rainfallMm: number; // in mm (1h or 3h)
  weatherCondition: string; // e.g. "Scattered Clouds", "Heavy Rain"
  weatherIcon: string;
  windSpeedKmh: number;
  city: string;
  isLive: boolean;
  lastUpdated: string;
}

// Fallback baseline for Dongri Buzurg (Bhandara District, Maharashtra)
const FALLBACK_DONGRI_WEATHER: LiveWeatherData = {
  temp: 31.4,
  feelsLike: 34.2,
  humidity: 68,
  rainfallMm: 4.2,
  weatherCondition: 'Partly Cloudy',
  weatherIcon: '02d',
  windSpeedKmh: 14.5,
  city: 'Bhandara (Dongri Buzurg)',
  isLive: false,
  lastUpdated: 'Fallback Baseline (Offline)',
};

/**
 * Fetch real-time weather from OpenWeatherMap API using coordinates
 * Dongri Buzurg: Lat 21.554, Lng 79.702
 */
export async function fetchLiveMineWeather(
  lat: number = 21.554,
  lon: number = 79.702,
  mineName: string = 'Dongri Buzurg'
): Promise<LiveWeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

  if (!apiKey || !apiKey.trim()) {
    console.info('[MOIL Weather] VITE_OPENWEATHER_API_KEY is not set. Using baseline.');
    return {
      ...FALLBACK_DONGRI_WEATHER,
      city: `${mineName} Station`,
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey.trim()}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[MOIL Weather] OpenWeather returned status ${response.status}. Falling back.`);
      return {
        ...FALLBACK_DONGRI_WEATHER,
        city: `${mineName} Station (Cached)`,
      };
    }

    const data = await response.json();

    const rain1h = data.rain ? data.rain['1h'] || data.rain['3h'] || 0 : 0;
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      temp: Math.round(data.main.temp * 10) / 10,
      feelsLike: Math.round(data.main.feels_like * 10) / 10,
      humidity: data.main.humidity,
      rainfallMm: Math.round(rain1h * 10) / 10,
      weatherCondition: data.weather[0]?.main || 'Clear',
      weatherIcon: data.weather[0]?.icon || '01d',
      windSpeedKmh: Math.round((data.wind?.speed || 0) * 3.6),
      city: `${data.name || mineName} Station`,
      isLive: true,
      lastUpdated: `Live Stream • ${timeString} IST`,
    };
  } catch (err) {
    console.error('[MOIL Weather] Error fetching live weather:', err);
    return {
      ...FALLBACK_DONGRI_WEATHER,
      city: `${mineName} Station`,
    };
  }
}
