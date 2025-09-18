import { describe, it, expect } from 'vitest';
import {
  byggFellesFeil,
  byggIngenEndringFeil,
  mapValidationErrors,
  type FellesValideringsInput
} from '../../utils/sendInnCommon';
import feiltekster from '../../utils/feiltekster';

// Minimal helper to clone base input
function baseInput(overrides: Partial<FellesValideringsInput> = {}): FellesValideringsInput {
  return {
    fullLonnIArbeidsgiverPerioden: undefined,
    lonnISykefravaeret: undefined,
    harRefusjonEndringer: undefined,
    opplysningerBekreftet: true,
    harForespurtArbeidsgiverperiode: true,
    ...overrides
  };
}

describe('sendInnCommon - byggFellesFeil', () => {
  it('returnerer feil når full lønn i arbeidsgiverperioden mangler og forespurt agp', () => {
    const feil = byggFellesFeil(baseInput());
    expect(feil.some((f) => f.text === feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN)).toBe(true);
  });

  it('returnerer ikke full-lønn-feil når forespurt arbeidsgiverperiode ikke finnes (harForespurtArbeidsgiverperiode=false)', () => {
    const feil = byggFellesFeil(baseInput({ harForespurtArbeidsgiverperiode: false }));
    expect(feil.some((f) => f.text === feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN)).toBe(false);
  });

  it('validerer begrunnelse og beløp når status=Nei på full lønn', () => {
    const feil = byggFellesFeil(
      baseInput({
        fullLonnIArbeidsgiverPerioden: { status: 'Nei' },
        lonnISykefravaeret: { status: 'Ja', beloep: 100 },
        harRefusjonEndringer: true
      })
    );
    // Forvent to feil: mangler begrunnelse + mangler beløp utbetalt
    expect(feil.filter((f) => f.felt === 'agp.redusertLoennIAgp.begrunnelse').length).toBe(1);
    expect(feil.filter((f) => f.felt === 'agp.redusertLoennIAgp.beloep').length).toBe(1);
  });

  it('krever lonnISykefravaeret status', () => {
    const feil = byggFellesFeil(
      baseInput({
        fullLonnIArbeidsgiverPerioden: { status: 'Ja' }
      })
    );
    expect(feil.some((f) => f.felt === 'lus-radio')).toBe(true);
  });

  it('krever refusjonEndringer når lonnISykefravaeret=Ja', () => {
    const feil = byggFellesFeil(
      baseInput({
        fullLonnIArbeidsgiverPerioden: { status: 'Ja' },
        lonnISykefravaeret: { status: 'Ja', beloep: 10 },
        harRefusjonEndringer: undefined
      })
    );
    expect(feil.some((f) => f.felt === 'refusjon.endringer')).toBe(true);
  });

  it('krever bekreft opplysninger', () => {
    const feil = byggFellesFeil(
      baseInput({
        opplysningerBekreftet: false,
        fullLonnIArbeidsgiverPerioden: { status: 'Ja' },
        lonnISykefravaeret: { status: 'Nei' },
        harRefusjonEndringer: false
      })
    );
    expect(feil.some((f) => f.felt === 'bekreft-opplysninger')).toBe(true);
  });

  it('returnerer tom liste ved komplett og gyldig input', () => {
    const feil = byggFellesFeil(
      baseInput({
        fullLonnIArbeidsgiverPerioden: { status: 'Ja' },
        lonnISykefravaeret: { status: 'Nei' },
        harRefusjonEndringer: false,
        opplysningerBekreftet: true
      })
    );
    expect(feil.length).toBe(0);
  });
});

describe('refusjon endringer tri-state', () => {
  const base = {
    fullLonnIArbeidsgiverPerioden: { status: 'Ja' } as any,
    opplysningerBekreftet: true
  };

  it('gir feil når status=Ja og harRefusjonEndringer er undefined (ikke besvart)', () => {
    const feil = byggFellesFeil({
      ...base,
      lonnISykefravaeret: { status: 'Ja' } as any,
      harRefusjonEndringer: undefined
    });
    expect(feil.some((f) => f.felt === 'refusjon.endringer')).toBe(true);
  });

  it('gir ikke feil når status=Ja og harRefusjonEndringer=false (Nei valgt)', () => {
    const feil = byggFellesFeil({
      ...base,
      lonnISykefravaeret: { status: 'Ja' } as any,
      harRefusjonEndringer: false
    });
    expect(feil.some((f) => f.felt === 'refusjon.endringer')).toBe(false);
  });

  it('gir ikke “mangler svar”-feil når status=Ja og harRefusjonEndringer=true', () => {
    const feil = byggFellesFeil({
      ...base,
      lonnISykefravaeret: { status: 'Ja' } as any,
      harRefusjonEndringer: true
    });
    const refusjonFeil = feil.filter((f) => f.felt === 'refusjon.endringer');
    expect(refusjonFeil.length).toBe(0);
  });
});

describe('sendInnCommon - byggIngenEndringFeil', () => {
  it('lager standard feilrespons for ingen endring', () => {
    const feil = byggIngenEndringFeil();
    expect(feil).toHaveLength(1);
    expect(feil[0].property).toBe('knapp-innsending');
  });
});

describe('sendInnCommon - mapValidationErrors', () => {
  it('mappe backend valideringsfeil når valideringsfeil finnes', () => {
    const backend = {
      error: 'validation',
      valideringsfeil: ['feil1', 'feil2']
    } as any;
    const mapped = mapValidationErrors(backend, []);
    expect(mapped).toHaveLength(2);
    expect(mapped[0].property).toBe('server');
  });

  it('returnerer generisk feil når valideringsfeil mangler', () => {
    const backend = { error: 'annet' } as any;
    const mapped = mapValidationErrors(backend, []);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].error).toMatch(/feil i systemet/);
  });
});
