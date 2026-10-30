import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import KvitteringRefusjon from '../../components/kvittering/KvitteringRefusjon';
import { KvitteringVisning } from '../../utils/lagKvitteringVisning';

afterEach(() => {
  cleanup();
});

describe('KvitteringRefusjon', () => {
  const refusjon: KvitteringVisning['refusjon'] = {
    loenn: { status: 'Ja', beloep: 0 },
    endringer: [{ startdato: new Date(2024, 5, 1), beloep: 0 }]
  };

  it('viser nullbeløp og refusjonsendringer uten å endre dataene', () => {
    render(<KvitteringRefusjon refusjon={refusjon} fullLonnIArbeidsgiverperioden={{ status: 'Ja' }} />);

    expect(screen.getByRole('heading', { name: 'Refusjon' })).toBeVisible();
    expect(screen.getByText(/Betaler arbeidsgiver ut full lønn/)).toBeVisible();
    expect(screen.getByText('0,00 kr/måned')).toBeVisible();
    const table = screen.getByRole('table');
    expect(within(table).getByRole('cell', { name: '01.06.2024' })).toBeVisible();
    expect(within(table).getByRole('cell', { name: '0,00' })).toBeVisible();
    expect(refusjon.endringer).toEqual([{ startdato: new Date(2024, 5, 1), beloep: 0 }]);
  });

  it('kan vise refusjon uten spørsmål om full lønn i arbeidsgiverperioden', () => {
    render(<KvitteringRefusjon refusjon={{ loenn: { status: 'Nei' }, endringer: [] }} />);

    expect(screen.queryByText(/Betaler arbeidsgiver ut full lønn/)).not.toBeInTheDocument();
    expect(screen.getByText('Nei')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
