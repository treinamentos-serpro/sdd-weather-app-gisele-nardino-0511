import { useState } from 'react';
import type { Unit } from './types/weather';
import { useWeather } from './hooks/useWeather';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import HourlyForecastList from './components/HourlyForecastList';
import CityResults from './components/CityResults';
import LoadingState from './components/states/LoadingState';
import ErrorState from './components/states/ErrorState';
import EmptyState from './components/states/EmptyState';
import type { ForecastView } from './types/weather';

/**
 * WeatherView — aplicação completa de previsão do tempo.
 *
 * Construída ao longo do treinamento de Spec-Driven Development com GitHub
 * Copilot, do briefing à entrega.
 */
export default function App() {
  const { status, data, cities, error, query, search, selectCity, retry } = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const [forecastView, setForecastView] = useState<ForecastView>('hourly');

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀️
            </span>
            <h1 className="text-lg font-bold">WeatherView</h1>
          </div>
          <div className="flex w-full flex-col items-end gap-3 sm:w-auto sm:flex-1 sm:flex-row sm:justify-end">
            <SearchBar onSearch={search} disabled={status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {status === 'idle' && (
          <EmptyState
            title="Busque uma cidade para começar"
            hint="Ex.: Seattle, Lisboa, São Paulo…"
          />
        )}

        {status === 'loading' && <LoadingState />}

        {status === 'success' && !data && (
          <CityResults cities={cities} onSelect={selectCity} />
        )}

        {status === 'empty' && (
          <EmptyState
            title={`Nenhuma cidade encontrada para "${query}"`}
            hint="Verifique a grafia e tente novamente."
          />
        )}

        {status === 'error' && error && <ErrorState message={error} onRetry={retry} />}

        {status === 'success' && data && (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <section aria-label="Visualização da previsão" className="space-y-4">
              <div role="group" aria-label="Período da previsão" className="inline-flex gap-2">
                <button
                  type="button"
                  aria-pressed={forecastView === 'hourly'}
                  onClick={() => setForecastView('hourly')}
                  className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                >
                  Por hora
                </button>
                <button
                  type="button"
                  aria-pressed={forecastView === 'daily'}
                  onClick={() => setForecastView('daily')}
                  className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                >
                  Por dia
                </button>
              </div>
              {forecastView === 'hourly' ? (
                <HourlyForecastList forecast={data.hourlyForecast ?? []} unit={unit} />
              ) : (
                <ForecastList forecast={data.forecast} unit={unit} />
              )}
            </section>
          </>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-white/60">
        Dados por{' '}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="text-accent-400 hover:underline"
        >
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}
