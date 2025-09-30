import { ErrorResponse } from './useErrorResponse';
import { BackendValidationError } from './postInnsending';
import feiltekster from './feiltekster';
import validerFullLonnIArbeidsgiverPerioden from '../validators/validerFullLonnIArbeidsgiverPerioden';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret } from '../state/state';

export function byggIngenEndringFeil(): ErrorResponse[] {
  return [
    {
      value: 'Innsending av skjema feilet',
      error: 'Innsending feilet, det er ikke gjort endringer i skjema.',
      property: 'knapp-innsending'
    }
  ];
}

export function mapValidationErrors(feil: BackendValidationError, errors: ErrorResponse[]) {
  if (feil.valideringsfeil) {
    errors = feil.valideringsfeil.map(
      (error: any) =>
        ({
          error: error,
          property: 'server',
          value: 'Innsending av skjema feilet'
        }) as ErrorResponse
    );
  } else {
    errors = [
      {
        value: 'Innsending av skjema feilet',
        error: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.',
        property: 'server'
      }
    ];
  }
  return errors;
}

export type MinimalData = {
  inntekt?: { beloep?: number | null } | null;
  agp?: { redusertLoennIAgp?: { beloep?: number | null } | null };
};

export type SafeParseMinimal<D extends MinimalData = MinimalData> =
  | { success: true; data: D }
  | { success: false; error: any };

interface FeltFeil {
  text: string;
  felt: string;
}

export function checkCommonValidations<D extends MinimalData, R extends SafeParseMinimal<D>>(
  fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden | undefined,
  harForespurtArbeidsgiverperiode: boolean,
  lonnISykefravaeret: LonnISykefravaeret | undefined,
  harRefusjonEndringer: string | undefined,
  opplysningerBekreftet: boolean,
  validerteData: R
): FeltFeil[] {
  const errors: FeltFeil[] = [];

  if (!fullLonnIArbeidsgiverPerioden?.status && harForespurtArbeidsgiverperiode) {
    errors.push({
      text: feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN,
      felt: 'lia-radio'
    });
  }

  if (fullLonnIArbeidsgiverPerioden) {
    const valErrors = validerFullLonnIArbeidsgiverPerioden(fullLonnIArbeidsgiverPerioden);

    const mapValErrors = valErrors.map((err) => {
      const key = err.code as keyof typeof feiltekster;
      return {
        felt: err.felt,
        text: feiltekster[key] ?? err.text
      };
    });

    errors.push(...mapValErrors);
  }

  if (!lonnISykefravaeret?.status) {
    errors.push({
      text: 'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.',
      felt: 'lus-radio'
    });
  }

  if (lonnISykefravaeret?.status === 'Ja' && !harRefusjonEndringer) {
    errors.push({
      text: 'Vennligst angi om det er endringer i refusjonsbeløpet i perioden.',
      felt: 'refusjon.endringer'
    });
  }

  if (!opplysningerBekreftet) {
    errors.push({
      text: feiltekster.BEKREFT_OPPLYSNINGER,
      felt: 'bekreft-opplysninger'
    });
  }

  if (
    validerteData.success === true &&
    (validerteData.data?.inntekt?.beloep ?? 0) < (validerteData.data?.agp?.redusertLoennIAgp?.beloep ?? 0)
  ) {
    errors.push({ text: feiltekster.INNTEKT_UNDER_REFUSJON, felt: 'agp.redusertLoennIAgp.beloep' });
  }
  return errors;
}
