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
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);

  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const setKvitteringsdata = useBoundStore((state) => state.setKvitteringsdata);
  const errorResponse = useErrorRespons();
  const router = useRouter();
  const fyllAapenInnsending = useFyllAapenInnsending();

  return async (opplysningerBekreftet: boolean, pathSlug: string, isDirtyForm: boolean, skjemaData: any) => {
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

    if (isValidUUID(pathSlug)) {
      skjemaData.aarsakInnsending = 'Endring';
    } else {
      skjemaData.aarsakInnsending = 'Ny';
    }
    const validerteData = fyllAapenInnsending(skjemaData);

    if (validerteData.success !== true) {
      logger.error('Feil ved validering av skjema - Åpen innsending');
      logger.error(validerteData.error);
    }

    if (
      validerteData.success === false ||
      !opplysningerBekreftet ||
      (!harRefusjonEndringer && lonnISykefravaeret?.status === 'Ja') ||
      !fullLonnIArbeidsgiverPerioden?.status ||
      !lonnISykefravaeret?.status ||
      (!refusjonskravetOpphoerer?.status && lonnISykefravaeret?.status === 'Ja') ||
      (refusjonskravetOpphoerer?.status === 'Ja' && !refusjonskravetOpphoerer?.opphoersdato)
    ) {
      const errors: ValiderTekster[] =
        validerteData.success === false
          ? validerteData.error.issues.map((issue) => {
              return {
                text: issue.message,
                felt: issue.path.join('.')
              };
            })
          : [];

      if (!fullLonnIArbeidsgiverPerioden?.status) {
        errors.push({
          text: feiltekster.INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN,
          felt: 'lia-radio'
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

      if (lonnISykefravaeret?.status === 'Ja' && !refusjonskravetOpphoerer) {
        errors.push({
          text: 'Vennligst angi om refusjonskravet opphører.',
          felt: 'lus-sluttdato-velg'
        });
      }

      if (refusjonskravetOpphoerer?.status === 'Ja' && !refusjonskravetOpphoerer?.opphoersdato) {
        errors.push({
          text: 'Angi siste dato det kreves refusjon for.',
          felt: 'lus-sluttdato'
        });
      }

      if (!opplysningerBekreftet) {
        errors.push({
          text: feiltekster.BEKREFT_OPPLYSNINGER,
          felt: 'bekreft-opplysninger'
        });
      }

      if ((validerteData.data?.inntekt?.beloep ?? 0) < (validerteData.data?.agp?.redusertLoennIAgp?.beloep ?? 0)) {
        errors.push({
          text: feiltekster.INNTEKT_UNDER_REFUSJON,
          felt: 'agp.redusertLoennIAgp.beloep'
        });
      }

      fyllFeilmeldinger(errors);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });

      // errorResponse(errors);
      setSkalViseFeilmeldinger(true);
    } else {
      setKvitteringsdata(validerteData.data);

      fyllFeilmeldinger([]);

      const innsending =
        pathSlug !== 'arbeidsgiverInitiertInnsending'
          ? { ...validerteData.data, selvbestemtId: pathSlug }
          : { ...validerteData.data, selvbestemtId: null };

      const URI = environment.innsendingAGInitiertUrl;

      return fetch(URI, {
        method: 'POST',
        body: JSON.stringify(innsending),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((data) => {
        switch (data.status) {
          case 200:
          case 201:
            data.json().then((response) => {
              if (response.selvbestemtId) {
                pathSlug = response.selvbestemtId;
              }

              setKvitteringInnsendt(new Date());
              if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
                router.push(`/kvittering/agi/${pathSlug}`, undefined, { shallow: true });
              } else {
                router.push(`/kvittering/${pathSlug}`, undefined, { shallow: true });
              }
            });
            break;

          case 500: {
            const errors: Array<ErrorResponse> = [
              {
                value: 'Innsending av skjema feilet',
                error: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.',
                property: 'server'
              }
            ];
            errorResponse(errors);

            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet - serverfeil',
              component: amplitudeComponent
            });

            logger.error('Feil ved innsending av skjema - 500', data);
            logger.error(data);

            break;
          }

          case 404: {
            const errors: Array<ErrorResponse> = [
              {
                value: 'Innsending av skjema feilet',
                error: 'Fant ikke endepunktet for innsending',
                property: 'server'
              }
            ];
            errorResponse(errors);

            logger.error('Feil ved innsending av skjema - 404', data);
            logger.error(data);

            break;
          }

          case 401: {
            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet - ingen tilgang',
              component: amplitudeComponent
            });

            innsendingFeiletIngenTilgang(true);
            break;
          }

          case 400: {
            return data.json().then((resultat) => {
              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet',
                component: amplitudeComponent
              });

              if (resultat.error) {
                const errors: Array<ErrorResponse> = resultat.valideringsfeil.map((error: any) => ({
                  error: error
                }));

                errorResponse(errors);

                logger.error('Feil ved innsending av skjema - 400 - BadRequest', data);
                logger.error(data);
              }
            });
          }

          default:
            return data.json().then((resultat) => {
              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet',
                component: amplitudeComponent
              });

              if (resultat.errors) {
                const errors: Array<ErrorResponse> = resultat.errors;
                errorResponse(errors);
              }
            });
        }
      });
    }
  };
}
