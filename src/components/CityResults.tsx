import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

/** Lista acessível de localidades para seleção explícita após o geocoding. */
export default function CityResults({ cities, onSelect }: CityResultsProps) {
  if (cities.length === 0) return null;

  return (
    <section aria-labelledby="city-results-title" className="space-y-3">
      <h2 id="city-results-title" className="text-lg font-semibold">
        Escolha uma cidade
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {cities.map((city) => {
          const details = [city.adminRegion ?? city.admin1, city.country].filter(Boolean).join(', ');
          return (
            <li key={`${city.id ?? city.name}-${city.latitude}-${city.longitude}`}>
              <button
                type="button"
                onClick={() => onSelect(city)}
                className="min-h-14 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-accent-400 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              >
                <span className="block font-semibold">{city.name}</span>
                {details && <span className="block text-sm text-white/60">{details}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}