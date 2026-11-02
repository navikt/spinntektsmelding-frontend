import { describe, expect, it } from 'vitest';
import { lagKvitteringVisning } from '../../utils/lagKvitteringVisning';
import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';
import formatTime from '../../utils/formatTime';

describe('lagKvitteringVisning', () => {
  it('normalizes API dates and gives periods stable IDs', () => {
    const visning = lagKvitteringVisning({
      sykmeldingsperioder: [{ fom: '2024-06-01', tom: '2024-06-30' }],
      arbeidsgiverperioder: [{ fom: '2024-06-01', tom: '2024-06-16' }],
      bestemmendeFravaersdag: '2024-06-01',
      naturalytelser: [{ naturalytelse: 'BIL', verdiBeloep: 2000, sluttdato: '2024-06-02' }]
    });

    expect(visning.sykmeldingsperioder).toEqual([
      { fom: parseIsoDate('2024-06-01'), tom: parseIsoDate('2024-06-30'), id: 'periode-0' }
    ]);
    expect(visning.arbeidsgiverperioder).toEqual([
      { fom: parseIsoDate('2024-06-01'), tom: parseIsoDate('2024-06-16'), id: 'periode-0' }
    ]);
    expect(visning.bestemmendeFravaersdag).toEqual(parseIsoDate('2024-06-01'));
    expect(visning.naturalytelser).toEqual([
      { naturalytelse: 'BIL', verdiBeloep: 2000, sluttdato: parseIsoDate('2024-06-02') }
    ]);
  });

  it('preserves store dates and period IDs without mutating input', () => {
    const dato = new Date(2024, 5, 1);
    const periode = Object.freeze({ fom: dato, tom: dato, id: 'lagret-id' });
    const input = Object.freeze({
      sykmeldingsperioder: Object.freeze([periode]),
      arbeidsgiverperioder: Object.freeze([periode]),
      bestemmendeFravaersdag: dato,
      naturalytelser: Object.freeze([
        Object.freeze({ naturalytelse: 'BIL' as const, verdiBeloep: 2000, sluttdato: dato })
      ])
    });

    const visning = lagKvitteringVisning(input);

    expect(visning.sykmeldingsperioder).toEqual(input.sykmeldingsperioder);
    expect(visning.arbeidsgiverperioder).toEqual(input.arbeidsgiverperioder);
    expect(visning.naturalytelser).toEqual(input.naturalytelser);
    expect(visning.bestemmendeFravaersdag).toEqual(dato);
    expect(visning.sykmeldingsperioder?.[0]).not.toBe(periode);
    expect(periode).toEqual({ fom: dato, tom: dato, id: 'lagret-id' });
  });

  it('represents missing receipt data explicitly', () => {
    expect(lagKvitteringVisning({})).toEqual({
      sykmeldingsperioder: undefined,
      arbeidsgiverperioder: undefined,
      inntekt: { beloep: undefined, endringAarsaker: [] },
      bestemmendeFravaersdag: undefined,
      naturalytelser: [],
      fullLonnIArbeidsgiverperioden: { status: 'Ja', begrunnelse: undefined, utbetalt: undefined },
      refusjon: { loenn: { status: 'Nei', beloep: undefined }, endringer: [] },
      mottatt: undefined,
      innsendingTidspunkt: '',
      sykmeldt: undefined,
      avsender: undefined
    });
  });

  it('preserves zero amounts, reduction reasons and refund changes on the cutoff day', () => {
    const visning = lagKvitteringVisning({
      inntektBeloep: 0,
      bestemmendeFravaersdag: '2024-06-01',
      redusertLoennIAgp: { beloep: 0, begrunnelse: 'FerieEllerAvspasering' },
      refusjon: {
        beloepPerMaaned: 0,
        endringer: [
          { startdato: '2024-05-31', beloep: 100 },
          { startdato: '2024-06-01', beloep: 0 }
        ]
      }
    });

    expect(visning.inntekt.beloep).toBe(0);
    expect(visning.fullLonnIArbeidsgiverperioden).toEqual({
      status: 'Nei',
      begrunnelse: 'FerieEllerAvspasering',
      utbetalt: 0
    });
    expect(visning.refusjon).toEqual({
      loenn: { status: 'Ja', beloep: 0 },
      endringer: [{ startdato: parseIsoDate('2024-06-01'), beloep: 0 }]
    });
  });

  it('preserves both API and internal income change reasons', () => {
    const endringAarsaker = [
      { aarsak: 'Ferie' as const, ferier: [{ fom: '2024-06-01', tom: '2024-06-02' }] },
      { aarsak: 'Tariffendring' as const, gjelderFra: new Date(2024, 5, 1), bleKjent: new Date(2024, 5, 2) }
    ];

    expect(lagKvitteringVisning({ endringAarsaker }).inntekt.endringAarsaker).toEqual(endringAarsaker);
    expect(lagKvitteringVisning({ endringAarsaker: null }).inntekt.endringAarsaker).toEqual([]);
  });

  it('represents natural benefits without an end date without asserting a date exists', () => {
    expect(
      lagKvitteringVisning({ naturalytelser: [{ naturalytelse: 'BIL', verdiBeloep: 2000 }] }).naturalytelser
    ).toEqual([{ naturalytelse: 'BIL', verdiBeloep: 2000, sluttdato: undefined }]);
  });

  it.each(['2024-06-03T10:00:00+02:00', new Date('2024-06-03T10:00:00+02:00')])(
    'formats the received timestamp for %s',
    (mottatt) => {
      const dato = new Date(mottatt);
      const visning = lagKvitteringVisning({ mottatt });

      expect(visning.mottatt).toEqual(dato);
      expect(visning.innsendingTidspunkt).toBe(` - ${formatDate(dato)} kl. ${formatTime(dato)}`);
    }
  );
});
