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
import forespoerselType from '../config/forespoerselType';
import { postInnsending } from './postInnsending';
import { byggIngenEndringFeil, checkCommonValidations, mapValidationErrors } from './sendInnCommon';
import { ValiderTekster } from './validerInntektsmelding';

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

  // Helpers
  const showErrors = (errors: Array<ErrorResponse | ValiderTekster>) => {
    // Reset then set
    fyllFeilmeldinger([]);
    errorResponse(errors as Array<ErrorResponse>);
    setSkalViseFeilmeldinger(true);
  };

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

      showErrors(byggIngenEndringFeil());

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
    const errors = checkCommonValidations(
      fullLonnIArbeidsgiverPerioden,
      harForespurtArbeidsgiverperiode,
      lonnISykefravaeret,
      harRefusjonEndringer,
      opplysningerBekreftet,
      validerteData
    );

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
