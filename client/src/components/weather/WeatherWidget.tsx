import type { WeatherDay } from '../../types';

const WEATHER_ICONS: Record<number, string> = {
  0: '\u2600\uFE0F', 1: '\uD83C\uDF24\uFE0F', 2: '\u26C5', 3: '\u2601\uFE0F',
  45: '\uD83C\uDF2B\uFE0F', 48: '\uD83C\uDF2B\uFE0F',
  51: '\uD83C\uDF26\uFE0F', 53: '\uD83C\uDF26\uFE0F', 55: '\uD83C\uDF27\uFE0F',
  61: '\uD83C\uDF27\uFE0F', 63: '\uD83C\uDF27\uFE0F', 65: '\uD83C\uDF27\uFE0F',
  71: '\uD83C\uDF28\uFE0F', 73: '\u2744\uFE0F', 75: '\u2744\uFE0F', 77: '\uD83C\uDF28\uFE0F',
  80: '\uD83C\uDF26\uFE0F', 81: '\uD83C\uDF27\uFE0F', 82: '\u26C8\uFE0F',
  95: '\u26C8\uFE0F', 96: '\u26C8\uFE0F', 99: '\u26C8\uFE0F',
};

interface Props {
  days: WeatherDay[];
}

export function WeatherWidget({ days }: Props) {
  const today = days[0];
  if (!today) return null;

  const forecast = days.slice(0, 5);

  return (
    <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-3 font-semibold">5-Day Forecast</p>

      {/* Today highlight */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-800">
        <span className="text-4xl">{WEATHER_ICONS[today.weatherCode] ?? '\uD83C\uDF21\uFE0F'}</span>
        <div>
          <p className="text-stone-100 font-semibold">{today.description}</p>
          <p className="text-stone-400 text-sm">
            {today.tempMax}{'\u00B0'} / {today.tempMin}{'\u00B0'}F
            {' \u2022 '}{today.windSpeed} mph wind
            {today.precipitation > 0 && ` \u2022 ${today.precipitation.toFixed(1)}" rain`}
          </p>
        </div>
      </div>

      {/* Forecast days */}
      <div className="grid grid-cols-5 gap-2">
        {forecast.map((day, i) => {
          const label = i === 0
            ? 'Today'
            : new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg ${
                i === 0 ? 'bg-stone-800' : ''
              }`}
            >
              <p className="text-[10px] text-stone-500 font-medium">{label}</p>
              <span className="text-xl">{WEATHER_ICONS[day.weatherCode] ?? '\uD83C\uDF21\uFE0F'}</span>
              <p className="text-sm text-stone-100 font-semibold">{day.tempMax}{'\u00B0'}</p>
              <p className="text-[10px] text-stone-500">{day.tempMin}{'\u00B0'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
