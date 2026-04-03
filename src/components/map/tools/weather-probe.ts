// src/components/map/tools/weather-probe.ts
// Phase 12D — Weather Probe tool
// Click any map point → fetch weather data from Open-Meteo API (free, no key)

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import { formatDD, createVertexMarker } from './tool-utils';

// ─── State ───
let _map: google.maps.Map | null = null;
let _markers: google.maps.Marker[] = [];

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  cloudCover: number;
  weatherCode: number;
  weatherDesc: string;
  isDay: boolean;
}

// Cache with TTL
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const _cache: Map<string, { data: WeatherData; timestamp: number }> = new Map();

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

// WMO Weather interpretation codes
function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  const key = getCacheKey(lat, lng);
  const cached = _cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover,weather_code,is_day&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    const c = json.current;

    const data: WeatherData = {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      visibility: 10000, // Open-Meteo free tier doesn't include visibility
      pressure: c.surface_pressure,
      cloudCover: c.cloud_cover,
      weatherCode: c.weather_code,
      weatherDesc: getWeatherDescription(c.weather_code),
      isDay: c.is_day === 1,
    };

    _cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch {
    return null;
  }
}

function windDirectionToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// FSO impact assessment
function assessFSOImpact(data: WeatherData): { level: string; note: string } {
  if (data.weatherCode >= 61 || data.cloudCover > 90) {
    return { level: 'high', note: 'Heavy precipitation/cloud — FSO link attenuation expected' };
  }
  if (data.weatherCode >= 45 || data.humidity > 90 || data.cloudCover > 70) {
    return { level: 'moderate', note: 'Fog/high humidity — reduced FSO visibility possible' };
  }
  if (data.windSpeed > 40) {
    return { level: 'moderate', note: 'High wind — mounting vibration may affect beam alignment' };
  }
  return { level: 'low', note: 'Good conditions for FSO operations' };
}

function clearAll(): void {
  _markers.forEach(m => m.setMap(null));
  _markers = [];
}

export const weatherProbe: ToolHandler = {
  activate(options: ToolActivateOptions) {
    _map = options.map;
    options.onStatusChange('Click any point on the map to fetch real-time weather data.');
  },

  deactivate() {
    _map = null;
  },

  async handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions) {
    if (!_map) return;

    const lat = latLng.lat();
    const lng = latLng.lng();

    // Add marker
    const marker = createVertexMarker(latLng, _map, '#60A5FA', '☁');
    _markers.push(marker);

    options.onStatusChange('Fetching weather data...');
    options.onProcessingChange(true);

    const data = await fetchWeather(lat, lng);

    options.onProcessingChange(false);

    if (!data) {
      options.onStatusChange('Failed to fetch weather. Check internet connection.');
      options.onResult({
        toolId: 'weather-probe',
        timestamp: Date.now(),
        data: { error: 'Weather API request failed', location: formatDD(lat, lng) },
        overlays: _markers.slice(),
      });
      return;
    }

    const impact = assessFSOImpact(data);

    options.onStatusChange(
      `${data.weatherDesc} · ${data.temperature}°C · ${data.humidity}% humidity · Wind ${data.windSpeed} km/h`
    );

    const result: ToolResult = {
      toolId: 'weather-probe',
      timestamp: Date.now(),
      data: {
        location: formatDD(lat, lng),
        weather: {
          condition: data.weatherDesc,
          temperature: `${data.temperature}°C`,
          humidity: `${data.humidity}%`,
          wind: `${data.windSpeed} km/h ${windDirectionToCompass(data.windDirection)}`,
          windDirection: `${data.windDirection}°`,
          pressure: `${data.pressure.toFixed(0)} hPa`,
          cloudCover: `${data.cloudCover}%`,
          dayNight: data.isDay ? '☀️ Day' : '🌙 Night',
        },
        fsoImpact: impact,
        cached: _cache.has(getCacheKey(lat, lng)),
      },
      overlays: _markers.slice(),
    };

    options.onResult(result);
  },

  getCursor() {
    return 'crosshair';
  },
};

// Expose clearAll for toolbar
(weatherProbe as { clearAll?: () => void }).clearAll = clearAll;
