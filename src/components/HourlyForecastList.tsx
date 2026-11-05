import type { HourlyForecast, Unit } from '../types/weather';
import { formatTemperature, unitLabel } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import { getShortDate } from '../lib/format';

interface HourlyForecastListProps {
  forecast: HourlyForecast[];
  unit: Unit;
}

/** Exibe as próximas 24 horas no horário local retornado pela Open-Meteo. */
export default function HourlyForecastList({ forecast, unit }: HourlyForecastListProps) {
  const nextHours = forecast.slice(0, 24);

  return (
    <section aria-label="Previsão por hora">
      <h2 className="mb-4 text-xl font-bold">Próximas 24 horas</h2>
      {nextHours.length === 0 ? (
        <p role="status" className="text-white/70">
          Previsão horária indisponível.
        </p>
      ) : (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {nextHours.map((hour) => {
            const temperature =
              hour.temperature === null
                ? '—'
                : formatTemperature(hour.temperature, unit).replace(/°$/, unitLabel(unit));
            const condition =
              hour.weatherCode === null
                ? 'Condição indisponível'
                : getWeatherLabel(hour.weatherCode);

            return (
              <li
                key={hour.time}
                className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-md"
              >
                <time dateTime={hour.time} className="font-semibold">
                  {hour.time.slice(11, 16)}
                </time>
                <span className="text-xs text-white/60">{getShortDate(hour.time.slice(0, 10))}</span>
                <span aria-hidden="true" className="text-3xl">
                  {hour.weatherCode === null ? '🌡️' : getWeatherIcon(hour.weatherCode)}
                </span>
                <span className="text-xs text-white/70">{condition}</span>
                <span className="text-lg font-semibold">{temperature}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
