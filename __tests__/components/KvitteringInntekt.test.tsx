import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import KvitteringInntekt from '../../components/kvittering/KvitteringInntekt';
import { KvitteringVisning } from '../../utils/lagKvitteringVisning';

afterEach(() => {
  cleanup();
});

describe('KvitteringInntekt', () => {
  it.each<KvitteringVisning['inntekt']['endringAarsaker'][number]>([
    { aarsak: 'Ferie', ferier: [{ fom: '2024-06-01', tom: '2024-06-01' }] },
    { aarsak: 'Ferie', ferier: [{ fom: new Date(2024, 5, 1), tom: new Date(2024, 5, 1) }] }
  ])('viser årsaksperioder fra API og intern tilstand (%#)', (endring) => {
    const inntekt: KvitteringVisning['inntekt'] = {
      beloep: 0,
      endringAarsaker: [endring]
    };
    render(<KvitteringInntekt inntekt={inntekt} />);

    expect(screen.getByRole('heading', { name: 'Beregnet månedslønn' })).toBeVisible();
    expect(screen.getByText('0,00 kr/måned')).toBeVisible();
    expect(screen.getByText('Endret med årsak')).toBeVisible();
    expect(screen.getByText('Ferie fra')).toBeVisible();
    expect(screen.getByText('Ferie til')).toBeVisible();
    expect(screen.getAllByText('01.06.2024')).toHaveLength(2);
  });

  it('viser ikke årsakstekst uten endringsårsaker', () => {
    render(<KvitteringInntekt inntekt={{ beloep: 50000, endringAarsaker: [] }} />);

    expect(screen.queryByText('Endret med årsak')).not.toBeInTheDocument();
    expect(screen.getByText(/kr\/måned/)).toBeVisible();
  });
});
