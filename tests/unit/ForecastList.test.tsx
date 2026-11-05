import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import HourlyForecastList from '../../src/components/HourlyForecastList';
import type { ForecastDay } from '../../src/types/weather';

const forecast: ForecastDay[] = [
  {
    date: '2026-11-05',
    min: 10,
    max: 20,
    weatherCode: 3,
    precipitationProbability: 25,
  },
  {
    date: '2026-11-06',
    min: null,
    max: null,
    weatherCode: null,
    precipitationProbability: null,
  },
  {
    date: '2026-11-07',
    min: 12,
    max: 22,
    weatherCode: 1,
    precipitationProbability: 10,
  },
  {
    date: '2026-11-08',
    min: 13,
    max: 23,
    weatherCode: 2,
    precipitationProbability: 15,
  },
  {
    date: '2026-11-09',
    min: 14,
    max: 24,
    weatherCode: 0,
    precipitationProbability: 0,
  },
];

describe('ForecastList', () => {
  it('renderiza cinco cards com dia, condição, máximas/mínimas na unidade atual e chuva', () => {
    render(<ForecastList forecast={forecast} unit="fahrenheit" />);

    const region = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    const cards = within(region).getAllByRole('listitem');
    const firstCard = within(cards[0]);

    expect(cards).toHaveLength(5);
    expect(firstCard.getByText('Hoje')).toBeInTheDocument();
    expect(firstCard.getByText('Nublado')).toBeInTheDocument();
    expect(firstCard.getByText('Máx.')).toBeInTheDocument();
    expect(firstCard.getByText('68°F')).toBeInTheDocument();
    expect(firstCard.getByText('Mín.')).toBeInTheDocument();
    expect(firstCard.getByText('50°F')).toBeInTheDocument();
    expect(firstCard.getByText('Chuva 25%')).toBeInTheDocument();
  });

  it('sinaliza campos ausentes sem inventar valores', () => {
    render(<ForecastList forecast={forecast} unit="celsius" />);

    const secondCard = within(screen.getAllByRole('listitem')[1]);
    expect(secondCard.getByText('Condição indisponível')).toBeInTheDocument();
    expect(secondCard.getAllByText('—')).toHaveLength(2);
    expect(secondCard.getByText('Chuva —')).toBeInTheDocument();
  });

  it('exibe previsão horária em ordem local, converte unidade e informa campos ausentes', () => {
    render(
      <HourlyForecastList
        forecast={[
          { time: '2026-11-05T12:00', temperature: 20, weatherCode: 0 },
          { time: '2026-11-05T13:00', temperature: null, weatherCode: null },
        ]}
        unit="fahrenheit"
      />,
    );

    const region = screen.getByRole('region', { name: 'Previsão por hora' });
    const hours = within(region).getAllByRole('listitem');
    expect(hours).toHaveLength(2);
    expect(within(hours[0]).getByText('12:00')).toBeInTheDocument();
    expect(within(hours[0]).getByText('68°F')).toBeInTheDocument();
    expect(within(hours[1]).getByText('13:00')).toBeInTheDocument();
    expect(within(hours[1]).getByText('Condição indisponível')).toBeInTheDocument();
    expect(within(hours[1]).getByText('—')).toBeInTheDocument();
  });
});