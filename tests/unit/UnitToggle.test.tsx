import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import UnitToggle from '../../src/components/UnitToggle';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherType, Unit } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

const current: CurrentWeatherType = {
  time: '2026-06-16T12:00',
  temperature: 0, // 0°C => 32°F (fácil de verificar)
  humidity: 80,
  windSpeed: 10,
  pressure: 1015,
  precipitation: 0,
  weatherCode: 3,
};

function Harness() {
  const [unit, setUnit] = useState<Unit>('celsius');
  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('UnitToggle + CurrentWeather', () => {
  it('converte a temperatura ao alternar a unidade', async () => {
    render(<Harness />);
    expect(screen.getByText('0°C')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fahrenheit (°F)' }));
    expect(screen.getByText('32°F')).toBeInTheDocument();
  });

  it('expõe os botões com estado pressionado acessível', () => {
    render(<Harness />);

    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius (°C)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit (°F)' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('permite navegar e selecionar a unidade pelo teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);
    const celsiusButton = screen.getByRole('button', { name: 'Celsius (°C)' });
    const fahrenheitButton = screen.getByRole('button', { name: 'Fahrenheit (°F)' });

    await user.tab();
    expect(celsiusButton).toHaveFocus();
    await user.tab();
    expect(fahrenheitButton).toHaveFocus();
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});
