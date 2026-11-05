import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('não dispara busca com input vazio', async () => {
    const onSearch = vi.fn();
    const { container } = render(<SearchBar onSearch={onSearch} />);
    fireEvent.submit(container.querySelector('form')!);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('expõe landmark de busca e input com label acessível', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: /pesquisa de cidades/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /buscar cidade/i })).toBeInTheDocument();
  });

  it('envia o termo aparado pela remoção de espaços externos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: /buscar cidade/i }), '  Lisboa  ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    expect(onSearch).toHaveBeenCalledWith('Lisboa');
  });

  it('não permite submeter somente espaços', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: /buscar cidade/i });

    await user.type(input, '   ');

    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('desabilita input e botão quando disabled está ativo', () => {
    render(<SearchBar onSearch={vi.fn()} disabled />);

    expect(screen.getByRole('searchbox', { name: /buscar cidade/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
  });
});
