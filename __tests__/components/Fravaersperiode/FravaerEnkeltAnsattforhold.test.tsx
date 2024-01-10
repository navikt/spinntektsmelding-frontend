import { render, screen } from '@testing-library/react';
import FravaerEnkeltAnsattforhold from '../../../components/Fravaersperiode/FravaerEnkeltAnsattforhold';
import { vi } from 'vitest';

describe('FravaerEnkeltAnsattforhold', () => {
  it('should render fravaersperioder correctly', () => {
    const fravaersperioder = [
      { fom: new Date(2002, 0, 1), tom: new Date(2002, 0, 15), id: '1' },
      { fom: new Date(2002, 1, 1), tom: new Date(2002, 1, 15), id: '2' }
    ];

    const mockFn = vi.fn();

    render(
      <FravaerEnkeltAnsattforhold
        fravaersperioder={fravaersperioder}
        startSisteAktivePeriode={new Date(2002, 0, 10)}
        setIsDirtyForm={mockFn}
      />
    );
    const fom1 = screen.getByText('01.01.2002');
    expect(fom1).toBeInTheDocument();
    const tom1 = screen.getByText('15.01.2002');
    expect(tom1).toBeInTheDocument();

    const fom2 = screen.getByText('01.02.2002');
    expect(fom2).toBeInTheDocument();
    const tom2 = screen.getByText('15.02.2002');
    expect(tom2).toBeInTheDocument();

    const varsel = screen.getByText('Dere vil motta en separat forespørsel om inntektsmelding for denne perioden.');
    expect(varsel).toBeInTheDocument();
  });

  it('should render no fravaersperioder message when fravaersperioder is empty', () => {
    const fravaersperioder = [
      { fom: new Date(2002, 0, 1), tom: new Date(2002, 0, 15), id: '1' },
      { fom: new Date(2002, 1, 1), tom: new Date(2002, 1, 15), id: '2' }
    ];

    const mockFn = vi.fn();

    render(
      <FravaerEnkeltAnsattforhold
        fravaersperioder={fravaersperioder}
        startSisteAktivePeriode={new Date(2002, 2, 10)}
        setIsDirtyForm={mockFn}
      />
    );
    const fom1 = screen.getByText('01.01.2002');
    expect(fom1).toBeInTheDocument();
    const tom1 = screen.getByText('15.01.2002');
    expect(tom1).toBeInTheDocument();

    const fom2 = screen.getByText('01.02.2002');
    expect(fom2).toBeInTheDocument();
    const tom2 = screen.getByText('15.02.2002');
    expect(tom2).toBeInTheDocument();

    const varsel = screen.queryByText('Dere vil motta en separat forespørsel om inntektsmelding for denne perioden.');
    expect(varsel).not.toBeInTheDocument();
  });
});
