import type { ForecastDay, Unit } from '../types/weather';
import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import { getDayLabel, getShortDate } from '../lib/format';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

/** Card de um dia da previsão. */
export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const weatherLabel =
    day.weatherCode === null ? 'Condição indisponível' : getWeatherLabel(day.weatherCode);
  const weatherIcon = day.weatherCode === null ? '🌡️' : getWeatherIcon(day.weatherCode);
  const maximum =
    day.max === null ? '—' : formatTemperature(day.max, unit).replace(/°$/, unit === 'celsius' ? '°C' : '°F');
  const minimum =
    day.min === null ? '—' : formatTemperature(day.min, unit).replace(/°$/, unit === 'celsius' ? '°C' : '°F');
  const precipitation =
    day.precipitationProbability === null ? '—' : `${day.precipitationProbability}%`;

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-md sm:p-4">
      <p className="font-semibold">{getDayLabel(day.date, index)}</p>
      <p className="text-xs text-white/60">{getShortDate(day.date)}</p>
      <span aria-hidden="true" className="text-3xl">
        {weatherIcon}
      </span>
      <p className="text-xs text-white/70">{weatherLabel}</p>
      <dl className="grid w-full grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-white/60">Máx.</dt>
          <dd className="font-semibold">{maximum}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/50">Mín.</dt>
          <dd className="text-white/70">{minimum}</dd>
        </div>
      </dl>
      <p className="text-xs text-accent-400">
        <span aria-hidden="true">💧 </span>
        Chuva {precipitation}
      </p>
    </li>
  );
}
