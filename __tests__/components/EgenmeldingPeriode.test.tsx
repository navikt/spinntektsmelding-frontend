import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import EgenmeldingPeriode from '../../components/Egenmelding/EgenmeldingPeriode';
import { vi } from 'vitest';

describe('EgenmeldingPeriode', () => {
  it('should have no violations', async () => {
    const mockFn = vi.fn();
    const { container } = render(
      <EgenmeldingPeriode
        periodeId='1'
        egenmeldingsperiode={{ fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 10), id: '1' }}
        kanEndreEgenmeldingPeriode={false}
        setEgenmeldingDato={vi.fn()}
        toDate={new Date(2022, 10, 10)}
        kanSlettes={false}
        onSlettRad={vi.fn()}
        disabled={false}
        rad={1}
        visFeilmeldingTekst={mockFn}
      />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be able to add periode', async () => {
    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    vi.mock('../../components/Datovelger', () => ({
      default: () => <div>Datovelger</div>
    }));

    const mockFn = vi.fn();

    const { container } = render(
      <EgenmeldingPeriode
        periodeId='1'
        egenmeldingsperiode={{ fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 10), id: '1' }}
        kanEndreEgenmeldingPeriode={true}
        setEgenmeldingDato={vi.fn()}
        toDate={new Date(2022, 10, 10)}
        kanSlettes={false}
        onSlettRad={vi.fn()}
        disabled={false}
        rad={1}
        visFeilmeldingTekst={mockFn}
      />
    );

    const leggTilKnapp = await screen.findAllByText('Datovelger');
    expect(leggTilKnapp).toHaveLength(2);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
