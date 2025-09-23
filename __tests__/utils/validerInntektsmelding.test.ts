import { describe, it, expect, expectTypeOf } from 'vitest';
import { ErrorCodes, ValiderResultat, ValiderTekster } from '../../utils/validerInntektsmelding';
// import type { BruttoinntektFeilkode } from '../../utils/validators/validerBruttoinntekt';
import type { PeriodeFeilkode } from '../../validators/validerPeriode';
import type { FullLonnIArbeidsgiverPerioden } from '../../validators/validerFullLonnIArbeidsgiverPerioden';
import type { FullLonnISykefravaeret } from '../../validators/validerLonnISykefravaeret';
import type { NaturalytelserFeilkoder } from '../../validators/validerNaturalytelser';
import type { LonnIArbeidsgiverperiodenFeilkode } from '../../validators/validerLonnIArbeidsgiverperioden';
import type { LonnUnderSykefravaeretFeilkode } from '../../validators/validerLonnUnderSykefravaeret';
import type { PeriodeEgenmeldingFeilkode } from '../../validators/validerPeriodeEgenmelding';
import type { BekreftOpplysningerFeilkoder } from '../../validators/validerBekreftOpplysninger';
import type { EndringAvMaanedslonnFeilkode } from '../../validators/validerEndringAvMaanedslonn';
import type { TelefonFeilkode } from '../../validators/validerTelefon';
import type { PeriodeFravaerFeilkode } from '../../validators/validerPeriodeFravaer';
import type { PeriodeOverlappFeilkode } from '../../validators/validerPeriodeOverlapp';
import type { BruttoinntektFeilkode } from '../../validators/validerBruttoinntekt';

// Import union members as types only to avoid runtime dependencies

describe('validerInntektsmelding type contracts', () => {
  it('ValiderTekster has required string fields', () => {
    expectTypeOf<ValiderTekster>().toExtend<{ felt: string; text: string }>();
  });

  it('ValiderResultat has correct field types', () => {
    expectTypeOf<ValiderResultat['felt']>().toExtend<string>();

    // code should accept each union member type
    expectTypeOf<PeriodeFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<BruttoinntektFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<FullLonnIArbeidsgiverPerioden>().toExtend<ValiderResultat['code']>();
    expectTypeOf<FullLonnISykefravaeret>().toExtend<ValiderResultat['code']>();
    expectTypeOf<NaturalytelserFeilkoder>().toExtend<ValiderResultat['code']>();
    expectTypeOf<LonnIArbeidsgiverperiodenFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<LonnUnderSykefravaeretFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<BekreftOpplysningerFeilkoder>().toExtend<ValiderResultat['code']>();
    expectTypeOf<EndringAvMaanedslonnFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<PeriodeEgenmeldingFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<PeriodeFravaerFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<TelefonFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<PeriodeOverlappFeilkode>().toExtend<ValiderResultat['code']>();
    expectTypeOf<ErrorCodes>().toExtend<ValiderResultat['code']>();

    // code should also accept the ErrorCodes string literals
    // expectTypeOf<'INGEN_ARBEIDSFORHOLD'>().toExtend<ValiderResultat['code']>();
    // expectTypeOf<'INGEN_FRAVAERSPERIODER'>().toExtend<ValiderResultat['code']>();
    // expectTypeOf<'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN'>().toExtend<ValiderResultat['code']>();
    // expectTypeOf<'INGEN_LONN_I_SYKEFRAVAERET'>().toExtend<ValiderResultat['code']>();
  });

  it('accepts a valid ValiderResultat example with ErrorCodes value', () => {
    const result: ValiderResultat = {
      felt: 'someField',
      code: 'INGEN_ARBEIDSFORHOLD'
    };
    expect(result.felt).toBe('someField');
    expect(result.code).toBe('INGEN_ARBEIDSFORHOLD');
  });
});

function buildResult(code: ErrorCodes): ValiderResultat {
  return {
    felt: 'dummy-felt',
    code
  };
}

describe('ErrorCodes enum', () => {
  const expectedEntries: [keyof typeof ErrorCodes, string][] = [
    ['INGEN_ARBEIDSFORHOLD', 'INGEN_ARBEIDSFORHOLD'],
    ['INGEN_FRAVAERSPERIODER', 'INGEN_FRAVAERSPERIODER'],
    ['INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN', 'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN'],
    ['INGEN_LONN_I_SYKEFRAVAERET', 'INGEN_LONN_I_SYKEFRAVAERET']
  ];

  it('har eksakt de forventede enum-key/value-parene', () => {
    // Sjekk keys
    expect(Object.keys(ErrorCodes).sort()).toEqual(expectedEntries.map(([k]) => k).sort());
    // Sjekk values
    expect(Object.values(ErrorCodes).sort()).toEqual(expectedEntries.map(([, v]) => v).sort());
  });

  it('hver enumverdi kan brukes i et ValiderResultat (type codeUnion)', () => {
    expectedEntries.forEach(([, value]) => {
      const code = value as ErrorCodes;
      const resultat = buildResult(code);
      expect(resultat.code).toBe(code);
    });
  });

  it('inneholder ingen duplikate values', () => {
    const values = Object.values(ErrorCodes);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('matcher snapshot av enum-objektet (fanger utilsiktede endringer)', () => {
    expect(ErrorCodes).toMatchInlineSnapshot(`
      {
        "INGEN_ARBEIDSFORHOLD": "INGEN_ARBEIDSFORHOLD",
        "INGEN_FRAVAERSPERIODER": "INGEN_FRAVAERSPERIODER",
        "INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN": "INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN",
        "INGEN_LONN_I_SYKEFRAVAERET": "INGEN_LONN_I_SYKEFRAVAERET",
      }
    `);
  });
});
