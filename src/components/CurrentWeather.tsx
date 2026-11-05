import type { CurrentWeather as CurrentWeatherType, City, Unit } from '../types/weather';
import { formatTemperature, unitLabel } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherType;
  unit: Unit;
}

interface MetricProps {
  icon: string;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <dl className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md sm:px-4">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div>
        <dt className="text-xs text-white/60">{label}</dt>
        <dd className="font-semibold">{value}</dd>
      </div>
    </dl>
  );
}

/** Seção "hero" com as condições atuais da cidade selecionada. */
export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.admin1, city.country].filter(Boolean).join(', ');
  const weatherCode = current.weatherCode ?? current.condition?.code ?? null;
  const weatherIcon = weatherCode === null ? '🌡️' : getWeatherIcon(weatherCode);
  const weatherLabel =
    current.condition?.descriptionPtBr ??
    (weatherCode === null ? 'Condição indisponível' : getWeatherLabel(weatherCode));
  const temperature =
    current.temperature === null
      ? '—'
      : formatTemperature(current.temperature, unit).replace(/°$/, unitLabel(unit));
  const freshness = current.freshness ?? 'unknown';
  const freshnessMessage =
    freshness === 'stale'
      ? 'Dados meteorológicos desatualizados.'
      : freshness === 'unknown'
        ? 'Não foi possível confirmar a atualidade dos dados.'
        : null;
  const timestamp = current.observedAt ?? current.time;
  const timestampLabel = current.observedAt ? 'Observado em' : 'Horário informado pela fonte';

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{city.name}</h2>
          {location && <p className="text-white/60">{location}</p>}

          <div className="mt-6 flex items-center gap-4">
            <span aria-hidden="true" className="text-6xl">
              {weatherIcon}
            </span>
            <span className="text-6xl font-light md:text-7xl">
              {temperature}
            </span>
          </div>
          <p className="mt-2 text-white/70">{weatherLabel}</p>
          {timestamp && (
              <p className="mt-1 text-sm text-white/60">
              {timestampLabel}: {timestamp}
            </p>
          )}
          {freshnessMessage && (
            <p role="status" className="mt-2 text-sm text-sun">
              {freshnessMessage}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric
            icon="💧"
            label="Umidade"
            value={current.humidity === null ? '—' : `${Math.round(current.humidity)}%`}
          />
          <Metric
            icon="💨"
            label="Vento"
            value={current.windSpeed === null ? '—' : `${Math.round(current.windSpeed)} km/h`}
          />
          <Metric
            icon="🌧️"
            label="Precipitação"
            value={current.precipitation === null ? '—' : `${current.precipitation} mm`}
          />
          <Metric
            icon="📊"
            label="Pressão"
            value={current.pressure === null ? '—' : `${Math.round(current.pressure)} hPa`}
          />
        </div>
      </div>
    </section>
  );
}
