import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import { ValiderTekster } from './validerInntektsmelding';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/router';
import { logger } from '@navikt/next-logger';
import useFyllAapenInnsending from '../state/useFyllAapenInnsending';
import { SkjemaStatus } from '../state/useSkjemadataStore';
import isValidUUID from './isValidUUID';
import { postInnsending } from './postInnsending';
import {
  byggIngenEndringFeil,
  checkCommonValidations,
  mapValidationErrors,
  MinimalData,
  SafeParseMinimal
} from './sendInnCommon';
import { LonnIArbeidsgiverperioden } from '../state/state';

export default function useSendInnArbeidsgiverInitiertSkjema(
  innsendingFeiletIngenTilgang: (feilet: boolean) => void,
  amplitudeComponent: string,
  skjemastatus: SkjemaStatus
) {
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);

  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const setKvitteringData = useBoundStore((state) => state.setKvitteringData);
  const selvbestemtType = useBoundStore((state) => state.selvbestemtType);
  const errorResponse = useErrorRespons();
  const router = useRouter();
  const fyllAapenInnsending = useFyllAapenInnsending();

  const showErrors = (errors: Array<ErrorResponse | ValiderTekster>) => {
    fyllFeilmeldinger([]);
    errorResponse(errors as Array<ErrorResponse>);
    setSkalViseFeilmeldinger(true);
  };

  const buildClientSideErrors = (
    validerteData: ReturnType<typeof fyllAapenInnsending> extends infer R
      ? R extends { success: boolean; error?: any; data?: any }
        ? R
        : any
      : any,
    opplysningerBekreftet: boolean
  ): ValiderTekster[] => {
    const errors: ValiderTekster[] = [];

    if (validerteData.success === false) {
      errors.push(
        ...validerteData.error.issues.map((issue: any) => ({
          text: issue.error ?? issue.message,
          felt: issue.path.join('.')
        }))
      );
    }

    const formData: typeof validerteData.data | {} = validerteData.success ? validerteData.data : {};

    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'fullLonn' in formData && formData.fullLonn ? formData.fullLonn : undefined,
      utbetalt: 'agp' in formData ? formData.agp?.redusertLoennIAgp?.beloep : undefined,
      begrunnelse: 'agp' in formData ? formData.agp?.redusertLoennIAgp?.begrunnelse : undefined
    };

    const harForespurtArbeidsgiverperiode = true; // Alltid true for selvbestemt
    errors.push(
      ...checkCommonValidations(
        fullLonnIArbeidsgiverPerioden,
        harForespurtArbeidsgiverperiode,
        lonnISykefravaeret,
        harRefusjonEndringer,
        opplysningerBekreftet,
        validerteData as SafeParseMinimal<MinimalData>
      )
    );
    return errors;
  };

  return async (
    opplysningerBekreftet: boolean,
    pathSlug: string,
    isDirtyForm: boolean,
    skjemaData: any,
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

    const validerteData = fyllAapenInnsending(skjemaData, selvbestemtType, erBegrensetForespoersel);
    const errors = buildClientSideErrors(validerteData, opplysningerBekreftet);

    setSkalViseFeilmeldinger(true);

    if (errors.length > 0 || validerteData.success !== true) {
      fyllFeilmeldinger(errors);
      logger.warn(
        `Feil ved validering av skjema - Åpen innsending ${JSON.stringify(validerteData.error)} ${JSON.stringify(errors)}`
      );
      logEvent('skjema validering feilet', { tittel: 'Validering feilet', component: amplitudeComponent });
      return false;
    }

    // Success path
    setKvitteringData(validerteData.data);
    fyllFeilmeldinger([]);

    const innsending = isValidUUID(pathSlug)
      ? { ...validerteData.data, selvbestemtId: pathSlug }
      : { ...validerteData.data, selvbestemtId: null };

    const URI = environment.innsendingAGInitiertUrl;

    type SuccessBody = { selvbestemtId?: string } | null;
    return postInnsending<typeof innsending, SuccessBody>({
      url: URI,
      body: innsending,
      amplitudeComponent,
      onUnauthorized: () => innsendingFeiletIngenTilgang(true),
      onSuccess: async (body) => {
        if (body?.selvbestemtId) pathSlug = body.selvbestemtId;
        setKvitteringInnsendt(new Date());
        if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
          router.push(`/kvittering/agi/${pathSlug}`);
        } else {
          router.push(`/kvittering/${pathSlug}`);
        }
      },
      mapValidationErrors,
      setErrorResponse: errorResponse,
      setShowErrorList: setSkalViseFeilmeldinger
    });
  };
}
