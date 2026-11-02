import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import KvitteringFooter from '../../components/kvittering/KvitteringFooter';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('KvitteringFooter', () => {
  it('viser mottakstidspunkt, saksoversikt og handlingene Endre og Skriv ut', async () => {
    const user = userEvent.setup();
    const onEndre = vi.fn();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { container } = render(
      <KvitteringFooter
        innsendingTidspunkt=' - 01.06.2024 kl. 12:00'
        saksoversiktUrl='https://mocked.nav.no'
        onEndre={onEndre}
      />
    );

    expect(screen.getByText('Inntektsmelding innsendt - 01.06.2024 kl. 12:00')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Lukk' })).toHaveAttribute('href', 'https://mocked.nav.no');
    expect(container.querySelector('.skjul-fra-print')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Endre' }));
    await user.click(screen.getByRole('button', { name: 'Skriv ut' }));

    expect(onEndre).toHaveBeenCalledTimes(1);
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('viser ikke Endre for ekstern kvittering og legger ikke til et manglende tidspunkt', () => {
    render(<KvitteringFooter innsendingTidspunkt='' saksoversiktUrl='https://mocked.nav.no' />);

    expect(screen.queryByRole('button', { name: 'Endre' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skriv ut' })).toBeVisible();
    expect(screen.getByText('Inntektsmelding innsendt')).toBeVisible();
  });
});
