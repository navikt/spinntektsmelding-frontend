import { render, screen } from '@testing-library/react';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
import parseIsoDate from '../../utils/parseIsoDate';
import { vi, expect } from 'vitest';
import { useFormContext, useFieldArray } from 'react-hook-form';
import formatDate from '../../utils/formatDate';

vi.mock('react-hook-form');

describe('VelgAarsak', () => {
  const clickTilbakestillMaanedsinntekt = vi.fn();
  const tariffendringDato = parseIsoDate('2022-01-01');
  const tariffkjentdato = parseIsoDate('2022-01-01');
  const ferie = [{ fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-05'), id: '1' }];
  const permisjon = [{ fom: parseIsoDate('2022-01-10'), tom: parseIsoDate('2022-01-15'), id: '1' }];
  const permittering = [{ fom: parseIsoDate('2022-01-20'), tom: parseIsoDate('2022-01-25'), id: '1' }];
  const nystillingdato = parseIsoDate('2022-01-01');
  const nystillingsprosentdato = parseIsoDate('2022-01-01');
  const lonnsendringsdato = parseIsoDate('2022-01-01');
  const sykefravaerperioder = [{ fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-05'), id: '1' }];
  const bestemmendeFravaersdag = parseIsoDate('2022-01-01');
  const nyInnsending = true;
  const kanIkkeTilbakestilles = false;
  const sammeSomSist = false;

  beforeEach(() => {
    vi.mocked(useFormContext).mockReturnValue({
      formState: { errors: {} },
      watch: vi.fn(() => 'inntekt.endringAarsak.aarsak'),
      register: vi.fn()
    });
  });

  it('should render the component with the correct labels', () => {
    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={tariffendringDato}
        tariffkjentdato={tariffkjentdato}
        ferie={ferie}
        permisjon={permisjon}
        permittering={permittering}
        nystillingdato={nystillingdato}
        nystillingsprosentdato={nystillingsprosentdato}
        lonnsendringsdato={lonnsendringsdato}
        sykefravaerperioder={sykefravaerperioder}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
      />
    );

    expect(screen.getByLabelText(`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`)).toBeInTheDocument();

    expect(screen.getByText(/Tilbakestill/)).toBeInTheDocument();
  });

  it('should call clickTilbakestillMaanedsinntekt when "Tilbakestill" button is clicked', () => {
    const clickTilbakestillMaanedsinntektMock = vi.fn();

    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        tariffendringDato={tariffendringDato}
        tariffkjentdato={tariffkjentdato}
        ferie={ferie}
        permisjon={permisjon}
        permittering={permittering}
        nystillingdato={nystillingdato}
        nystillingsprosentdato={nystillingsprosentdato}
        lonnsendringsdato={lonnsendringsdato}
        sykefravaerperioder={sykefravaerperioder}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
      />
    );

    const tilbakestillButton = screen.getByRole('button', { name: /Tilbakestill/ });
    tilbakestillButton.click();

    expect(clickTilbakestillMaanedsinntektMock).toHaveBeenCalledTimes(1);
  });

  it.skip('should show Sykefravaer', () => {
    // Her må det mockes mer for å få testen til å fungere
    const clickTilbakestillMaanedsinntektMock = vi.fn();
    vi.mocked(useFormContext).mockReturnValue({
      formState: { errors: {} },
      watch: vi.fn(() => 'Sykefravaer'),
      register: vi.fn()
    });

    vi.mocked(useFieldArray).mockReturnValue({
      fields: [
        {
          id: '1',
          fom: parseIsoDate('2022-01-01'),
          tom: parseIsoDate('2022-01-05')
        }
      ]
    });

    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        tariffendringDato={tariffendringDato}
        tariffkjentdato={tariffkjentdato}
        ferie={ferie}
        permisjon={permisjon}
        permittering={permittering}
        nystillingdato={nystillingdato}
        nystillingsprosentdato={nystillingsprosentdato}
        lonnsendringsdato={lonnsendringsdato}
        sykefravaerperioder={sykefravaerperioder}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
      />
    );

    expect(screen.getByText(/Fra/)).toBeInTheDocument();
    expect(screen.getByText(/Til/)).toBeInTheDocument();
  });
});
