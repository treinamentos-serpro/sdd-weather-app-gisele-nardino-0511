import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { weatherDataMock } from '../../src/mocks/weatherData';

describe('CurrentWeather', () => {
  it('exibe cidade, condição, temperatura com unidade e métricas', () => {
    render(
      <CurrentWeather
        city={weatherDataMock.city}
        current={weatherDataMock.current}
        unit="celsius"
      />,
    );

    const region = screen.getByRole('region', { name: 'Clima atual' });
    expect(within(region).getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(within(region).getByText('23°C')).toBeInTheDocument();
    expect(within(region).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(region).getByText('68%')).toBeInTheDocument();
    expect(within(region).getByText('13 km/h')).toBeInTheDocument();
    expect(within(region).getByText('0 mm')).toBeInTheDocument();
    expect(within(region).getByText('1013 hPa')).toBeInTheDocument();
  });

  it('identifica dados desatualizados e mostra o horário observado', () => {
    render(
      <CurrentWeather
        city={weatherDataMock.city}
        current={{
          ...weatherDataMock.current,
          freshness: 'stale',
          observedAt: '2026-11-04T12:00:00-03:00',
        }}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Dados meteorológicos desatualizados.');
    expect(screen.getByText(/Observado em: 2026-11-04T12:00:00-03:00/)).toBeInTheDocument();
    expect(screen.getByText('74°F')).toBeInTheDocument();
  });

  it('sinaliza campos ausentes e freshness desconhecido sem inventar valores', () => {
    render(
      <CurrentWeather
        city={weatherDataMock.city}
        current={{
          ...weatherDataMock.current,
          temperature: null,
          weatherCode: null,
          humidity: null,
          windSpeed: null,
          pressure: null,
          precipitation: null,
          time: null,
          observedAt: null,
          freshness: 'unknown',
          condition: null,
        }}
        unit="celsius"
      />,
    );

    const region = screen.getByRole('region', { name: 'Clima atual' });
    expect(within(region).getByText('Condição indisponível')).toBeInTheDocument();
    expect(within(region).getAllByText('—')).toHaveLength(5);
    expect(within(region).getByRole('status')).toHaveTextContent(
      'Não foi possível confirmar a atualidade dos dados.',
    );
  });
});
