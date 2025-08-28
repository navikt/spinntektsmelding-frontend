import { describe, it, expect, expectTypeOf } from 'vitest';
import type { ValiderResultat, ValiderTekster } from '../../utils/validerInntektsmelding';
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
    expectTypeOf<ValiderTekster>().toMatchTypeOf<{ felt: string; text: string }>();
  });

  it('ValiderResultat has correct field types', () => {
    expectTypeOf<ValiderResultat['felt']>().toMatchTypeOf<string>();

    // code should accept each union member type
    expectTypeOf<PeriodeFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<BruttoinntektFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<FullLonnIArbeidsgiverPerioden>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<FullLonnISykefravaeret>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<NaturalytelserFeilkoder>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<LonnIArbeidsgiverperiodenFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<LonnUnderSykefravaeretFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<BekreftOpplysningerFeilkoder>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<EndringAvMaanedslonnFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<PeriodeEgenmeldingFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<PeriodeFravaerFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<TelefonFeilkode>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<PeriodeOverlappFeilkode>().toMatchTypeOf<ValiderResultat['code']>();

    // code should also accept the ErrorCodes string literals
    expectTypeOf<'INGEN_ARBEIDSFORHOLD'>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<'INGEN_FRAVAERSPERIODER'>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN'>().toMatchTypeOf<ValiderResultat['code']>();
    expectTypeOf<'INGEN_LONN_I_SYKEFRAVAERET'>().toMatchTypeOf<ValiderResultat['code']>();
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
