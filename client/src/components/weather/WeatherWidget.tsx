import type { WeatherDay } from '../../types';

const WEATHER_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '❄️', 75: '❄️', 77: '🌨️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

interface Props {
  days: WeatherDay[];
}

export function WeatherWidget({ days }: Props) {
  const today = days[0];
  if (!today) return null;

  return (
    <div className="bg-stone-800 rounded-xl p-4">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-3 font-semibold">7-Day Forecast at Campsite</p>

      {/* Today highlight */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-700">
        <span className="text-4xl">{WEATHER_ICONS[today.weatherCode] ?? '🌡️'}</span>
        <div>
          <p className="text-stone-200 font-medium">{today.description}</p>
          <p className="text-stone-400 text-sm">
            {today.tempMax}° / {today.tempMin}°F · {today.windSpeed} mph wind
            {today.precipitation > 0 && ` · ${today.precipitation.toFixed(1)}" rain`}
          </p>
        </div>
      </div>

      {/* Remaining days */}
      <div className="grid grid-cols-6 gap-1">
        {days.slice(1).map((day) => {
          const label = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 text-center">
              <p className="text-[10px] text-stone-500">{label}</p>
              <span className="text-lg">{WEATHER_ICONS[day.weatherCode] ?? '🌡️'}</span>
              <p className="text-xs text-stone-300 font-medium">{day.tempMax}°</p>
              <p className="text-[10px] text-stone-500">{day.tempMin}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
