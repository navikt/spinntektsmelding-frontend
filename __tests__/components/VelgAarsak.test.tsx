import { render, screen } from '@testing-library/react';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
import parseIsoDate from '../../utils/parseIsoDate';
import { vi, expect } from 'vitest';
import { useFormContext, useFieldArray } from 'react-hook-form';
import formatDate from '../../utils/formatDate';
import userEvent from '@testing-library/user-event';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';

vi.mock('react-hook-form');

describe('VelgAarsak', () => {
  const clickTilbakestillMaanedsinntekt = vi.fn();
  const perioder = [{ fom: '2022-01-01', tom: '2022-01-05' }];
  const bestemmendeFravaersdag = parseIsoDate('2022-01-01');
  const nyInnsending = true;
  const kanIkkeTilbakestilles = false;
  const sammeSomSist = false;
  const user = userEvent.setup();

  beforeEach(() => {
    vi.mocked(useFormContext).mockReturnValue({
      formState: { errors: {} },
      watch: vi.fn(() => 'inntekt.endringAarsak.aarsak'), //.mockReturnValue('VarigLoennsendring'),
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
    const clickTilbakestillMaanedsinntektMock = vi.fn();

    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        defaultEndringAarsak={{ aarsak: 'Sykefravaer', perioder: perioder }}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    expect(screen.getByText(/Månedsinntekt/)).toBeInTheDocument();
    expect(screen.getByText(/01.01.2022/)).toBeInTheDocument();
  });

  it.skip('should show Ferie', () => {
    const clickTilbakestillMaanedsinntektMock = vi.fn();

    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        defaultEndringAarsak={{ aarsak: 'Ferie', perioder: perioder }}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    expect(screen.getByText(/Månedsinntekt/)).toBeInTheDocument();
    expect(screen.getByText(/01.01.2022/)).toBeInTheDocument();
  });

  it.skip('should show Tariffendring', () => {
    const clickTilbakestillMaanedsinntektMock = vi.fn();

    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        defaultEndringAarsak={{ aarsak: 'Tariffendring', bleKjent: '2022-01-01', gjelderFra: '2022-01-05' }}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    expect(screen.getByText(/Månedsinntekt/)).toBeInTheDocument();
    expect(screen.getByText(/01.01.2022/)).toBeInTheDocument();
  });

  it.skip('should show VarigLoennsendring', () => {
    const clickTilbakestillMaanedsinntektMock = vi.fn();
    const dea: EndringAarsak = { aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring, gjelderFra: '2022-01-05' };
    render(
      <VelgAarsak
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntektMock}
        defaultEndringAarsak={dea}
        bestemmendeFravaersdag={bestemmendeFravaersdag}
        nyInnsending={nyInnsending}
        kanIkkeTilbakestilles={kanIkkeTilbakestilles}
        sammeSomSist={sammeSomSist}
        changeMaanedsintektHandler={vi.fn()}
        changeBegrunnelseHandler={vi.fn()}
      />
    );

    expect(screen.getByText(/Månedsinntekt/)).toBeInTheDocument();
    expect(screen.getByText(/01.01.2022/)).toBeInTheDocument();
  });
});
