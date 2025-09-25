import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import useFyllInnsending from '../state/useFyllInnsending';
import isValidUUID from './isValidUUID';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/router';
import { logger } from '@navikt/next-logger';
import FullInnsendingSchema from '../schema/FullInnsendingSchema';
import { z } from 'zod';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { Opplysningstype } from '../schema/ForespurtDataSchema';
import feiltekster from './feiltekster';
import forespoerselType from '../config/forespoerselType';
import { postInnsending, BackendValidationError } from './postInnsending';
import validerFullLonnIArbeidsgiverPerioden from '../validators/validerFullLonnIArbeidsgiverPerioden';

export default function useSendInnSkjema(
  innsendingFeiletIngenTilgang: (feilet: boolean) => void,
  amplitudeComponent: string
) {
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const fyllInnsending = useFyllInnsending();
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const errorResponse = useErrorRespons();
  const router = useRouter();

  type Skjema = z.infer<typeof HovedskjemaSchema>;

  return async (
    opplysningerBekreftet: boolean,
    forespurteOpplysningstyper: Opplysningstype[],
    pathSlug: string,
    isDirtyForm: boolean,
    formData: Skjema,
    erBegrensetForespoersel: boolean
  ) => {
    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: amplitudeComponent
    });

    if (!isDirtyForm) {
      logEvent('skjema fullført', {
        tittel: 'Innsending uten endringer i skjema',
        component: amplitudeComponent
      });

      logger.info('Innsending uten endringer i skjema');

      const errors: Array<ErrorResponse> = [
        {
          value: 'Innsending av skjema feilet',
          error: 'Innsending feilet, det er ikke gjort endringer i skjema.',
          property: 'knapp-innsending'
        }
      ];
      fyllFeilmeldinger([]);

      errorResponse(errors);
      setSkalViseFeilmeldinger(true);

      return false;
    }

    type FullInnsending = z.infer<typeof FullInnsendingSchema>;

    const skjemaData: FullInnsending = fyllInnsending(
      opplysningerBekreftet,
      pathSlug,
      forespurteOpplysningstyper,
      formData,
      erBegrensetForespoersel
    );
    const harForespurtArbeidsgiverperiode = forespurteOpplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
    const validerteData = FullInnsendingSchema.safeParse(skjemaData);

    if (validerteData.success === false) {
      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });

      logger.warn(
        `Feil ved validering ved innsending av skjema med id ${pathSlug}. Valideringsfeil: ${JSON.stringify(validerteData.error)}`
      );

      fyllFeilmeldinger(
        validerteData.error.issues.map((error) => ({
          felt: error.path.join('.'),
          text: (error as any).error ?? error.message
        }))
      );

      return false;
    }
    const errors = [];
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

      mapValErrors.forEach((el) => {
        errors.push(el);
      });
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

    fyllFeilmeldinger(errors);

    if (errors.length > 0) {
      return false;
    }

    if (!isValidUUID(pathSlug)) {
      const errors: Array<ErrorResponse> = [
        {
          value: 'Innsending av skjema feilet',
          error: 'Innsending av skjema feilet. Ugyldig identifikator',
          property: 'server'
        }
      ];

      logEvent('skjema validering feilet', {
        tittel: 'Ugyldig UUID ved innsending',
        component: amplitudeComponent
      });
      errorResponse(errors);

      return false;
    }

    return postInnsending<typeof skjemaData, null>({
      url: `${environment.innsendingUrl}`,
      body: skjemaData,
      amplitudeComponent,
      onUnauthorized: () => innsendingFeiletIngenTilgang(true),
      onSuccess: async () => {
        setKvitteringInnsendt(new Date());
        router.push(`/kvittering/${pathSlug}`);
      },
      mapValidationErrors,
      setErrorResponse: errorResponse,
      setShowErrorList: setSkalViseFeilmeldinger
    });
  };
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
