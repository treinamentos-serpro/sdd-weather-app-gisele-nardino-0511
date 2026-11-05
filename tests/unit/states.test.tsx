import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('componentes de estado', () => {
  it('anuncia o carregamento com role status', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando o clima');
  });

  it('exibe o erro e aciona retry', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Falha de rede" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede');
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('exibe título e dica no estado vazio', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" hint="Tente outro nome." />);

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Tente outro nome.')).toBeInTheDocument();
  });
});