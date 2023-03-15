import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi } from 'vitest';
import Periodevelger from '../../../components/Bruttoinntekt/Periodevelger';
import { Periode } from '../../../state/state';

describe('Periodevelger', () => {
  // Problemer med ekstern datovelgerkomponent
  it.skip('renders without a11y errors', async () => {
    const defaultPeriode: Periode = {
      fom: new Date(2023, 3, 4),
      tom: new Date(2023, 3, 9),
      id: '1'
    };
    const mockChange = vi.fn();
    const mockSlett = vi.fn();
    const { container } = render(
      <Periodevelger
        defaultRange={defaultPeriode}
        onRangeChange={mockChange}
        onSlettRad={mockSlett}
        fomTekst='Fom'
        tomTekst='Tom'
        fomID='fom'
        tomID='tom'
        kanSlettes={false}
        periodeId='id'
      />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders without slette knapp', () => {
    const defaultPeriode: Periode = {
      fom: new Date(2023, 3, 4),
      tom: new Date(2023, 3, 9),
      id: '1'
    };
    const mockChange = vi.fn();
    const mockSlett = vi.fn();
    render(
      <Periodevelger
        defaultRange={defaultPeriode}
        onRangeChange={mockChange}
        onSlettRad={mockSlett}
        fomTekst='Fom'
        tomTekst='Tom'
        fomID='fom'
        tomID='tom'
        kanSlettes={false}
        periodeId='id'
      />
    );

    const sletteknapp = screen.queryAllByRole('button', {
      name: /Slett periode/i
    });

    expect(sletteknapp).toHaveLength(0);
  });
  it('renders with slette knapp', () => {
    const defaultPeriode: Periode = {
      fom: new Date(2023, 3, 4),
      tom: new Date(2023, 3, 9),
      id: '1'
    };
    const mockChange = vi.fn();
    const mockSlett = vi.fn();
    render(
      <Periodevelger
        defaultRange={defaultPeriode}
        onRangeChange={mockChange}
        onSlettRad={() => mockSlett()}
        fomTekst='Fom'
        tomTekst='Tom'
        fomID='fom'
        tomID='tom'
        kanSlettes={true}
        periodeId='id'
      />
    );

    const sletteknapp = screen.queryAllByRole('button', {
      name: /Slett periode/i
    });

    expect(sletteknapp).toHaveLength(1);
  });
});
