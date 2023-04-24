import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';

import Arbeidsgiverperiode from '../../../components/Arbeidsgiverperiode';
import { Periode } from '../../../state/state';
import { vi, expect, describe } from 'vitest';

describe('TidligereInntekt', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have no violations', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2022, 6, 6), tom: new Date(2022, 6, 16), id: '123' }];

    const { container } = render(<Arbeidsgiverperiode arbeidsgiverperioder={arbeidsgiverperiode} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be able to add periode', async () => {
    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    vi.mock('../../../components/Datovelger', () => ({
      default: () => <div>Datovelger</div>
    }));

    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2022, 6, 6), tom: new Date(2022, 6, 16), id: '123' }];

    const { container } = render(<Arbeidsgiverperiode arbeidsgiverperioder={arbeidsgiverperiode} />);

    userEvent.click(screen.getByText('Endre'));

    const leggTilKnapp = await screen.findByText('Legg til periode');
    expect(leggTilKnapp).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should give a warning when arbeidsgiverperiode is more than 16 days', async () => {
    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    vi.mock('../../../components/Datovelger', () => ({
      default: () => <div>Datovelger</div>
    }));

    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2022, 6, 6), tom: new Date(2022, 6, 24), id: '123' }];

    const { container } = render(<Arbeidsgiverperiode arbeidsgiverperioder={arbeidsgiverperiode} />);

    const tekst = screen.getByText(
      'Arbeidsgiverperioden er oppgitt til 19 dager, men kan ikke være mer enn 16 dager totalt.'
    );

    expect(tekst).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
