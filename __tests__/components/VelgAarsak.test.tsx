import { render, screen } from '@testing-library/react';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
import parseIsoDate from '../../utils/parseIsoDate';
import { vi, expect } from 'vitest';
import { useFormContext, useFieldArray } from 'react-hook-form';
import formatDate from '../../utils/formatDate';
import userEvent from '@testing-library/user-event';

vi.mock('react-hook-form');

describe('VelgAarsak', () => {
  const clickTilbakestillMaanedsinntekt = vi.fn();
  const sykefravaerperioder = [{ fom: '2022-01-01', tom: '2022-01-05' }];
  const bestemmendeFravaersdag = parseIsoDate('2022-01-01');
  const nyInnsending = true;
  const kanIkkeTilbakestilles = false;
  const sammeSomSist = false;
  const user = userEvent.setup();

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
        defaultEndringAarsak={{ aarsak: 'Tariffendring', gjelderFra: '2022-01-01', bleKjent: '2022-01-01' }}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    expect(screen.getByLabelText(`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`)).toBeInTheDocument();

    expect(screen.getByText(/Tilbakestill/)).toBeInTheDocument();
  });

  it('should call clickTilbakestillMaanedsinntekt when "Tilbakestill" button is clicked', async () => {
    const clickTilbakestillMaanedsinntektMock = vi.fn();

    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        defaultEndringAarsak={{ aarsak: 'Tariffendring', gjelderFra: '2022-01-01', bleKjent: '2022-01-01' }}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    const tilbakestillButton = screen.getByRole('button', { name: /Tilbakestill/ });
    await user.click(tilbakestillButton);

    expect(clickTilbakestillMaanedsinntektMock).toHaveBeenCalledTimes(1);
  });

  it.skip('should show Sykefravaer', () => {
    // Her må det mockes mer for å få testen til å fungere
    const clickTilbakestillMaanedsinntektMock = vi.fn();
    vi.mocked(useFormContext).mockReturnValue({
      formState: {
        errors: {},
        isDirty: true,
        dirtyFields: { 'inntekt.beloep': true },
        isLoading: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        disabled: false,
        submitCount: 0,
        touchedFields: {}
      },
      watch: () => {},
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
        defaultEndringAarsak={{ aarsak: 'Sykefravaer', perioder: sykefravaerperioder }}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    expect(screen.getByText(/Fra/)).toBeInTheDocument();
    expect(screen.getByText(/Til/)).toBeInTheDocument();
  });
});
