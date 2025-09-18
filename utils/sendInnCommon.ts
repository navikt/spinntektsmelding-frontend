import { ErrorResponse } from './useErrorResponse';
import { BackendValidationError } from './postInnsending';
import feiltekster from './feiltekster';
import validerFullLonnIArbeidsgiverPerioden from '../validators/validerFullLonnIArbeidsgiverPerioden';
import { LonnIArbeidsgiverperioden, LonnISykefravaeret } from '../state/state';

export interface FellesValideringsInput {
  fullLonnIArbeidsgiverPerioden?: LonnIArbeidsgiverperioden;
  lonnISykefravaeret?: LonnISykefravaeret;
  harRefusjonEndringer: boolean | undefined;
  opplysningerBekreftet: boolean;
  harForespurtArbeidsgiverperiode?: boolean; // kun relevant for ordinær innsending
}

interface FeltFeil {
  felt: string;
  text: string;
}

export function byggFellesFeil({
  fullLonnIArbeidsgiverPerioden,
  lonnISykefravaeret,
  harRefusjonEndringer,
  opplysningerBekreftet,
  harForespurtArbeidsgiverperiode
}: FellesValideringsInput): FeltFeil[] {
  const errors: FeltFeil[] = [];

  if (!fullLonnIArbeidsgiverPerioden?.status && (harForespurtArbeidsgiverperiode ?? true)) {
    errors.push({ text: feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN, felt: 'lia-radio' });
  }

  if (fullLonnIArbeidsgiverPerioden) {
    const valErrors = validerFullLonnIArbeidsgiverPerioden(fullLonnIArbeidsgiverPerioden);
    valErrors.forEach((err) => {
      const key = err.code as keyof typeof feiltekster;
      errors.push({ felt: err.felt, text: feiltekster[key] ?? err.text });
    });
  }

  if (!lonnISykefravaeret?.status) {
    errors.push({
      text: 'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.',
      felt: 'lus-radio'
    });
  }

  if (lonnISykefravaeret?.status === 'Ja' && harRefusjonEndringer === undefined) {
    errors.push({
      text: 'Vennligst angi om det er endringer i refusjonsbeløpet i perioden.',
      felt: 'refusjon.endringer'
    });
  }

  if (!opplysningerBekreftet) {
    errors.push({ text: feiltekster.BEKREFT_OPPLYSNINGER, felt: 'bekreft-opplysninger' });
  }

  return errors;
}

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
