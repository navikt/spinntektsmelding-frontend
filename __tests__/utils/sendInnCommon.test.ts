import { describe, it, expect, vi, beforeEach } from 'vitest';
import { byggIngenEndringFeil, mapValidationErrors, checkCommonValidations } from '../../utils/sendInnCommon';
import feiltekster from '../../utils/feiltekster';
import type { LonnIArbeidsgiverperioden, LonnISykefravaeret } from '../../state/state';

// Mock validator for full lønn i arbeidsgiverperioden
vi.mock('../../validators/validerFullLonnIArbeidsgiverPerioden', () => ({
  default: vi.fn()
}));
import validerFullLonnIArbeidsgiverPerioden from '../../validators/validerFullLonnIArbeidsgiverPerioden';

type ZodSuccessLike = {
  success: true;
  data: {
    inntekt?: { beloep?: number } | null;
    agp: { redusertLoennIAgp?: { beloep?: number } | null };
  };
};

// Helpers
function zodSuccess(data: ZodSuccessLike['data']): any {
  return { success: true, data } as const;
}

const FULL_LONN_NEI: LonnIArbeidsgiverperioden = { status: 'Nei' } as any;
const LONN_SYKE_JA: LonnISykefravaeret = { status: 'Ja' } as any;
const LONN_SYKE_NEI: LonnISykefravaeret = { status: 'Nei' } as any;

beforeEach(() => {
  (validerFullLonnIArbeidsgiverPerioden as any).mockReset();
});

describe('byggIngenEndringFeil', () => {
  it('returnerer standard feilobjekt', () => {
    const res = byggIngenEndringFeil();
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      property: 'knapp-innsending'
    });
  });
});

describe('mapValidationErrors', () => {
  it('maper valideringsfeil hvis de finnes', () => {
    const input = {
      valideringsfeil: ['A', 'B']
    } as any;
    const res = mapValidationErrors(input, []);
    expect(res).toHaveLength(2);
    expect(res[0]).toMatchObject({
      property: 'server',
      value: 'Innsending av skjema feilet'
    });
  });

  it('gir generic feil hvis valideringsfeil mangler', () => {
    const input = {} as any;
    const res = mapValidationErrors(input, []);
    expect(res).toHaveLength(1);
    expect(res[0].error).toContain('feil i systemet');
  });
});

describe('checkCommonValidations', () => {
  it('feil når fullLonnIArbeidsgiverPerioden mangler og forespørsel krever den', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(undefined, true, LONN_SYKE_JA, 'Nei', true, zodSuccess({ agp: {} }));
    expect(result.some((f) => f.text === feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN)).toBe(true);
  });

  it('inkluderer validator-feil fra validerFullLonnIArbeidsgiverPerioden', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([
      { code: 'INGEN_FRAVAERSPERIODER', felt: 'x', text: 'original' }
    ]);
    const result = checkCommonValidations(FULL_LONN_NEI, true, LONN_SYKE_NEI, 'Nei', true, zodSuccess({ agp: {} }));
    expect(result.some((f) => f.felt === 'x')).toBe(true);
  });

  it('feil når lonnISykefravaeret ikke angitt', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(FULL_LONN_NEI, true, undefined, 'Nei', true, zodSuccess({ agp: {} }));
    expect(result.some((f) => f.felt === 'lus-radio')).toBe(true);
  });

  it('feil når status=Ja og harRefusjonEndringer er falsy (ikke valgt)', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(FULL_LONN_NEI, true, LONN_SYKE_JA, undefined, true, zodSuccess({ agp: {} }));
    expect(result.some((f) => f.felt === 'refusjon.endringer')).toBe(true);
  });

  it('ingen refusjon-endring-feil når status=Ja og harRefusjonEndringer=Ja', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(FULL_LONN_NEI, true, LONN_SYKE_JA, 'Ja', true, zodSuccess({ agp: {} }));
    expect(result.some((f) => f.felt === 'refusjon.endringer')).toBe(false);
  });

  it('feil når opplysninger ikke bekreftet', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(FULL_LONN_NEI, true, LONN_SYKE_NEI, 'Nei', false, zodSuccess({ agp: {} }));
    expect(result.some((f) => f.text === feiltekster.BEKREFT_OPPLYSNINGER)).toBe(true);
  });

  it('feil når inntekt < redusertLoennIAgp beløp', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(
      FULL_LONN_NEI,
      true,
      LONN_SYKE_NEI,
      'Nei',
      true,
      zodSuccess({
        inntekt: { beloep: 100 },
        agp: { redusertLoennIAgp: { beloep: 200 } }
      })
    );
    expect(result.some((f) => f.text === feiltekster.INNTEKT_UNDER_REFUSJON)).toBe(true);
  });

  it('ingen INNTEKT_UNDER_REFUSJON-feil når inntekt >= redusert beløp', () => {
    (validerFullLonnIArbeidsgiverPerioden as any).mockReturnValue([]);
    const result = checkCommonValidations(
      FULL_LONN_NEI,
      true,
      LONN_SYKE_NEI,
      'Nei',
      true,
      zodSuccess({
        inntekt: { beloep: 300 },
        agp: { redusertLoennIAgp: { beloep: 200 } }
      })
    );
    expect(result.some((f) => f.text === feiltekster.INNTEKT_UNDER_REFUSJON)).toBe(false);
  });
});
