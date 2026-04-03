import { useQuery } from '@tanstack/react-query';
import type { WeatherDay } from '../types';

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Heavy thunderstorm',
};

async function fetchWeather(lat: number, lng: number): Promise<WeatherDay[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('windspeed_unit', 'mph');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  const daily = data.daily;

  return (daily.time as string[]).map((date, i) => ({
    date,
    tempMax: Math.round(daily.temperature_2m_max[i]),
    tempMin: Math.round(daily.temperature_2m_min[i]),
    precipitation: daily.precipitation_sum[i],
    windSpeed: Math.round(daily.windspeed_10m_max[i]),
    weatherCode: daily.weathercode[i],
    description: WMO_DESCRIPTIONS[daily.weathercode[i] as number] ?? 'Unknown',
  }));
}

export function useWeather(lat: number | null, lng: number | null) {
  return useQuery<WeatherDay[]>({
    queryKey: ['weather', lat?.toFixed(2), lng?.toFixed(2)],
    queryFn: () => fetchWeather(lat!, lng!),
    enabled: !!lat && !!lng,
    staleTime: 30 * 60 * 1000,   // 30 min
    gcTime: 60 * 60 * 1000,      // 1 hour
    retry: 1,
  });
}
