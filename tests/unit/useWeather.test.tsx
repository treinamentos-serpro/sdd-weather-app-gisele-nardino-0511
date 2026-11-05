import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import { useWeather } from '../../src/hooks/useWeather';
import { weatherDataMock } from '../../src/mocks/weatherData';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

const SECOND_CITY: City = {
  ...weatherDataMock.city,
  id: 2,
  name: 'Lisboa',
};
const SECOND_WEATHER: WeatherData = { ...weatherDataMock, city: SECOND_CITY };

describe('useWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(searchCities).mockResolvedValue([weatherDataMock.city]);
    vi.mocked(getWeather).mockResolvedValue(weatherDataMock);
  });

  it('inicia em idle e mostra resultados sem selecionar uma cidade automaticamente', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.search('  São Paulo  ');
    });

    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      status: 'success',
      data: null,
      cities: [weatherDataMock.city],
      query: 'São Paulo',
      error: null,
    });

    await act(async () => {
      await result.current.selectCity(weatherDataMock.city);
    });

    expect(getWeather).toHaveBeenCalledWith(weatherDataMock.city);
    expect(result.current.data).toEqual(weatherDataMock);
  });

  it('termina em empty e não carrega forecast sem resultados', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade desconhecida');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('selectCity carrega a cidade sem executar geocoding', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(SECOND_CITY);
    });

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).toHaveBeenCalledWith(SECOND_CITY);
    expect(result.current.data?.city).toEqual(weatherDataMock.city);
    expect(result.current.status).toBe('success');
  });

  it('retry repete a busca mais recente se o geocoding falhar', async () => {
    vi.mocked(searchCities)
      .mockResolvedValueOnce([weatherDataMock.city])
      .mockRejectedValueOnce(new Error('Falha temporária'))
      .mockResolvedValueOnce([SECOND_CITY]);
    vi.mocked(getWeather)
      .mockResolvedValueOnce(SECOND_WEATHER);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });
    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('error');
    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenNthCalledWith(3, 'Lisboa');
    expect(result.current.cities).toEqual([SECOND_CITY]);
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(SECOND_CITY);
    });

    expect(getWeather).toHaveBeenLastCalledWith(SECOND_CITY);
    expect(result.current.data?.city).toEqual(SECOND_CITY);
    expect(result.current.status).toBe('success');
  });

  it('ignora respostas de geocoding obsoletas', async () => {
    let resolveOldSearch!: (cities: City[]) => void;
    const oldSearch = new Promise<City[]>((resolve) => {
      resolveOldSearch = resolve;
    });
    vi.mocked(searchCities).mockImplementation((name) =>
      name === 'Antiga' ? oldSearch : Promise.resolve([SECOND_CITY]),
    );
    vi.mocked(getWeather).mockResolvedValue(SECOND_WEATHER);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      const oldRequest = result.current.search('Antiga');
      await result.current.search('Lisboa');
      resolveOldSearch([weatherDataMock.city]);
      await oldRequest;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([SECOND_CITY]);
    expect(getWeather).not.toHaveBeenCalled();
  });
});