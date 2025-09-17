import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import { ValiderTekster } from './validerInntektsmelding';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/router';
import { logger } from '@navikt/next-logger';
import useFyllAapenInnsending from '../state/useFyllAapenInnsending';
import feiltekster from './feiltekster';
import { SkjemaStatus } from '../state/useSkjemadataStore';
import isValidUUID from './isValidUUID';
import { mapValidationErrors } from './useSendInnSkjema';
import { postInnsending } from './postInnsending';
import validerFullLonnIArbeidsgiverPerioden from '../validators/validerFullLonnIArbeidsgiverPerioden';

export default function useSendInnArbeidsgiverInitiertSkjema(
  innsendingFeiletIngenTilgang: (feilet: boolean) => void,
  amplitudeComponent: string,
  skjemastatus: SkjemaStatus
) {
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);

  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const setKvitteringData = useBoundStore((state) => state.setKvitteringData);
  const selvbestemtType = useBoundStore((state) => state.selvbestemtType);
  const errorResponse = useErrorRespons();
  const router = useRouter();
  const fyllAapenInnsending = useFyllAapenInnsending();

  // Helpers
  const showErrors = (errors: Array<ErrorResponse | ValiderTekster>) => {
    // Reset then set
    fyllFeilmeldinger([]);
    errorResponse(errors as Array<ErrorResponse>);
    setSkalViseFeilmeldinger(true);
  };

  const setAarsakInnsending = (data: any, pathSlug: string) => {
    data.aarsakInnsending = isValidUUID(pathSlug) ? 'Endring' : 'Ny';
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

    if (!fullLonnIArbeidsgiverPerioden?.status) {
      errors.push({ text: feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN, felt: 'lia-radio' });
    }

    if (fullLonnIArbeidsgiverPerioden) {
      const valErrors = validerFullLonnIArbeidsgiverPerioden(fullLonnIArbeidsgiverPerioden);

      const mapValErrors = valErrors.map((err) => ({
        felt: err.felt,
        text: feiltekster[err.code] ?? err.text
      }));

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
      errors.push({ text: feiltekster.BEKREFT_OPPLYSNINGER, felt: 'bekreft-opplysninger' });
    }

    if ((validerteData.data?.inntekt?.beloep ?? 0) < (validerteData.data?.agp?.redusertLoennIAgp?.beloep ?? 0)) {
      errors.push({ text: feiltekster.INNTEKT_UNDER_REFUSJON, felt: 'agp.redusertLoennIAgp.beloep' });
    }

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

      showErrors([
        {
          value: 'Innsending av skjema feilet',
          error: 'Innsending feilet, det er ikke gjort endringer i skjema.',
          property: 'knapp-innsending'
        }
      ]);
      return false;
    }

    setAarsakInnsending(skjemaData, pathSlug);
    const validerteData = fyllAapenInnsending(skjemaData, selvbestemtType, erBegrensetForespoersel);

    if (validerteData.success !== true) {
      logger.warn('Feil ved validering av skjema - Åpen innsending ' + JSON.stringify(validerteData.error));
    }

    const shouldShowErrors =
      validerteData.success === false ||
      !opplysningerBekreftet ||
      (!harRefusjonEndringer && lonnISykefravaeret?.status === 'Ja') ||
      !fullLonnIArbeidsgiverPerioden?.status ||
      !lonnISykefravaeret?.status;

    if (shouldShowErrors) {
      const errors = buildClientSideErrors(validerteData, opplysningerBekreftet);
      fyllFeilmeldinger(errors);
      logEvent('skjema validering feilet', { tittel: 'Validering feilet', component: amplitudeComponent });
      setSkalViseFeilmeldinger(true);
      return;
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
