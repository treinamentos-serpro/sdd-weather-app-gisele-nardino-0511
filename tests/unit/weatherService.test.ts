import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCities, getWeather, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  adminRegion: 'Washington',
  timezone: 'America/Los_Angeles',
  latitude: 47.6,
  longitude: -122.33,
};

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('fetchWithTimeout', () => {
    it('converte AbortError em timeout e limpa o timer', async () => {
      vi.useFakeTimers();
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, options: { signal: AbortSignal }) =>
            new Promise<Response>((_resolve, reject) => {
              options.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        ),
      );

      const request = searchCities('Seattle');
      const requestError = expect(request).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'A requisição demorou demais.',
      });
      await vi.advanceTimersByTimeAsync(10_000);

      await requestError;
      expect(vi.getTimerCount()).toBe(0);
    });

    it('converte falha de rede em WeatherServiceError e limpa o timer', async () => {
      vi.useFakeTimers();
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

      await expect(searchCities('Seattle')).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Falha de rede.',
      });
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('mapeia resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              timezone: 'America/Los_Angeles',
              latitude: 47.6,
              longitude: -122.33,
            },
          ],
        }),
      );
      const result = await searchCities('Seattle');
      expect(result).toEqual([CITY]);
    });

    it('codifica acentos e espaços na query e inclui os parâmetros do geocoding', async () => {
      const fetchMock = mockFetchOnce({ results: [] });
      vi.stubGlobal('fetch', fetchMock);

      await searchCities('São João');

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Jo%C3%A3o&count=10&language=pt&format=json',
      );
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });
  });

  describe('getWeather', () => {
    it('mapeia current e daily para WeatherData', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
            relative_humidity_2m: 80,
            wind_speed_10m: 10,
            surface_pressure: 1015,
            precipitation: 0,
            weather_code: 3,
          },
          timezone: 'America/Los_Angeles',
          hourly: {
            time: ['2026-06-16T12:00', '2026-06-16T13:00'],
            temperature_2m: [18, null],
            weather_code: [3],
          },
          daily: {
            time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
            weather_code: [3, 61, 80, 1, 0],
            temperature_2m_max: [20, 19, 22, 24, 25],
            temperature_2m_min: [12, 11, 13, 14, 15],
            precipitation_probability_max: [20, 90, 70, 10, null],
          },
        }),
      );

      const data = await getWeather(CITY);
      const requestUrl = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
      expect(requestUrl.searchParams.get('hourly')).toBe('temperature_2m,weather_code');
      expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius');
      expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
      expect(data.current).toEqual({
        time: '2026-06-16T12:00',
        temperature: 18,
        humidity: 80,
        windSpeed: 10,
        pressure: 1015,
        precipitation: 0,
        weatherCode: 3,
      });
      expect(data.forecast).toHaveLength(5);
      expect(data.forecast[0]).toEqual({
        date: '2026-06-16',
        weatherCode: 3,
        max: 20,
        min: 12,
        precipitationProbability: 20,
      });
      expect(data.forecast[4].precipitationProbability).toBeNull();
      expect(data.hourlyForecast).toEqual([
        { time: '2026-06-16T12:00', temperature: 18, weatherCode: 3 },
        { time: '2026-06-16T13:00', temperature: null, weatherCode: null },
      ]);
      expect(data.timezone).toBe('America/Los_Angeles');
    });

    it.each([
      { current: null, daily: { time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'] } },
      { current: {}, daily: null },
    ])('lança erro quando current ou daily estão ausentes', async (body) => {
      vi.stubGlobal('fetch', mockFetchOnce(body));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('lança erro quando daily não contém exatamente cinco datas válidas', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({
        current: {},
        daily: { time: ['2026-06-16', '2026-06-17'] },
      }));

      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });
  });
});
