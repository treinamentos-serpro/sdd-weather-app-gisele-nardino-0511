import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import { weatherDataMock } from '../../src/mocks/weatherData';
import App from '../../src/App';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(searchCities).mockResolvedValue([]);
    vi.mocked(getWeather).mockResolvedValue(weatherDataMock);
  });

  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('mostra o estado de carregamento durante a busca', () => {
    vi.mocked(searchCities).mockReturnValue(new Promise(() => {}));
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: /buscar cidade/i }), {
      target: { value: 'São Paulo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Carregando o clima');
  });

  it('mostra o estado vazio quando a busca não encontra cidades', async () => {
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: /buscar cidade/i }), {
      target: { value: 'Cidade inexistente' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: /nenhuma cidade encontrada para/i }),
    ).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('mostra o estado de erro quando a busca falha', async () => {
    vi.mocked(searchCities).mockRejectedValue(new Error('Falha técnica'));
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: /buscar cidade/i }), {
      target: { value: 'São Paulo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Algo deu errado. Tente novamente.');
    expect(screen.queryByText('Falha técnica')).not.toBeInTheDocument();
  });

  it('renderiza o mock de clima e converte as unidades sem nova consulta', async () => {
    vi.mocked(searchCities).mockResolvedValue([weatherDataMock.city]);
    render(<App />);

    fireEvent.change(screen.getByRole('searchbox', { name: /buscar cidade/i }), {
      target: { value: 'São Paulo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeInTheDocument();
    expect(screen.getByText('23°C')).toBeInTheDocument();
    expect(screen.getByText('26°C')).toBeInTheDocument();
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Fahrenheit (°F)' }));

    expect(screen.getByText('74°F')).toBeInTheDocument();
    expect(screen.getByText('79°F')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });
});
