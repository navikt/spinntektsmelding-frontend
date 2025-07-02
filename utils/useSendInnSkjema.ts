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
import ResponseBackendErrorSchema from '../schema/ResponseBackendErrorSchema';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { Opplysningstype } from '../schema/ForespurtDataSchema';
import feiltekster from './feiltekster';
import forespoerselType from '../config/forespoerselType';

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
  // const state = useBoundStore((state) => state);
  const errorResponse = useErrorRespons();
  const router = useRouter();

  type Skjema = z.infer<typeof HovedskjemaSchema>;

  return async (
    opplysningerBekreftet: boolean,
    forespurteOpplysningstyper: Opplysningstype[],
    pathSlug: string,
    isDirtyForm: boolean,
    formData: Skjema
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
      formData
    );
    const harForespurtArbeidsgiverperiode = forespurteOpplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
    const validerteData = FullInnsendingSchema.safeParse(skjemaData);
    console.log('validerteData', validerteData);
    if (validerteData.success === false) {
      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });

      logger.error('Feil ved validering ved innsending av skjema med id ', pathSlug);
      logger.error(validerteData.error);

      fyllFeilmeldinger(
        validerteData.error.errors.map((error) => ({
          felt: error.path.join('.'),
          text: error.message
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

    // if ((validerteData.data?.inntekt?.beloep ?? 0) < (validerteData.data?.agp?.redusertLoennIAgp?.beloep ?? 0)) {
    //   errors.push({
    //     text: feiltekster.INNTEKT_UNDER_REFUSJON,
    //     felt: 'agp.redusertLoennIAgp.beloep'
    //   });
    // }
    fyllFeilmeldinger(errors);
    console.log('errors', errors);
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

    return fetch(`${environment.innsendingUrl}`, {
      method: 'POST',
      body: JSON.stringify(skjemaData),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((data) => {
      console.log('Innsending av skjema', data);
      switch (data.status) {
        case 201:
          setKvitteringInnsendt(new Date());
          console.log('Innsending av skjema vellykket', data);
          router.push(`/kvittering/${pathSlug}`, undefined);
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

        default:
          return data.json().then((resultat) => {
            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet',
              component: amplitudeComponent
            });

            if (resultat.error) {
              const feilResultat = ResponseBackendErrorSchema.safeParse(resultat);
              if (feilResultat.success === true) {
                const feil = feilResultat.data;
                let errors: Array<ErrorResponse> = [];

                errors = mapValidationErrors(feil, errors, resultat);

                errorResponse(errors);
                setSkalViseFeilmeldinger(true);

                logger.error('Feil ved innsending av skjema - 400 - BadRequest', data);
                logger.error(data);
              }
            }
          });
      }
    });
  };
}

function mapValidationErrors(
  feil: { error: string; valideringsfeil: string[] },
  errors: ErrorResponse[],
  resultat: any
) {
  if (feil.valideringsfeil) {
    errors = resultat.valideringsfeil.map((error: any) => ({
      error: error
    }));
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
