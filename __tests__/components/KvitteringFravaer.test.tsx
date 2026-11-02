import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import KvitteringFravaer from '../../components/kvittering/KvitteringFravaer';

afterEach(() => {
  cleanup();
});

describe('KvitteringFravaer', () => {
  const props = {
    sykmeldingsperioder: [{ fom: new Date(2024, 5, 1), tom: new Date(2024, 5, 30), id: 'syk-1' }],
    arbeidsgiverperioder: [{ fom: new Date(2024, 5, 1), tom: new Date(2024, 5, 16), id: 'agp-1' }],
    bestemmendeFravaersdag: new Date(2024, 5, 1),
    paakrevdeOpplysninger: ['arbeidsgiverperiode'],
    ingenArbeidsgiverperioder: false
  };

  it('viser perioder, bestemmende fraværsdag og eksisterende datomarkør', () => {
    const { container } = render(<KvitteringFravaer {...props} visArbeidsgiverperiode visBestemmendeFravaersdag />);

    expect(screen.getByRole('heading', { name: 'Fraværsperiode' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Arbeidsgiverperiode' })).toBeVisible();
    expect(screen.getByText('30.06.2024')).toBeVisible();
    expect(screen.getByText('16.06.2024')).toBeVisible();
    expect(container.querySelector('[data-cy="bestemmendefravaersdag"]')).toHaveTextContent('01.06.2024');
  });

  it.each([
    [false, true],
    [true, false],
    [false, false]
  ])(
    'beholder sidens seksjonsvalg med visArbeidsgiverperiode=%s og visBestemmendeFravaersdag=%s',
    (visArbeidsgiverperiode, visBestemmendeFravaersdag) => {
      render(
        <KvitteringFravaer
          {...props}
          visArbeidsgiverperiode={visArbeidsgiverperiode}
          visBestemmendeFravaersdag={visBestemmendeFravaersdag}
        />
      );

      expect(!!screen.queryByRole('heading', { name: 'Fraværsperiode' })).toBe(visArbeidsgiverperiode);
      expect(!!screen.queryByRole('heading', { name: 'Arbeidsgiverperiode' })).toBe(visArbeidsgiverperiode);
      expect(!!screen.queryByRole('heading', { name: 'Bestemmende fraværsdag' })).toBe(visBestemmendeFravaersdag);
    }
  );

  it('viser fravær av arbeidsgiverperiode når siden angir det', () => {
    render(<KvitteringFravaer {...props} arbeidsgiverperioder={[]} visArbeidsgiverperiode ingenArbeidsgiverperioder />);

    expect(screen.getByText('Det er ikke arbeidsgiverperiode.')).toBeVisible();
    expect(screen.queryByText(/Arbeidsgiver er ansvarlig for/)).not.toBeInTheDocument();
  });

  it('beholder sidens visning når bestemmende fraværsdag mangler', () => {
    const { rerender } = render(
      <KvitteringFravaer
        {...props}
        bestemmendeFravaersdag={undefined}
        visBestemmendeFravaersdag
        manglendeFravaersdag={<span>Venter på dato</span>}
      />
    );

    expect(screen.getByText('Venter på dato')).toBeVisible();

    rerender(<KvitteringFravaer {...props} bestemmendeFravaersdag={undefined} visBestemmendeFravaersdag />);

    expect(screen.queryByText('Venter på dato')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bestemmende fraværsdag' })).toBeVisible();
  });
});
