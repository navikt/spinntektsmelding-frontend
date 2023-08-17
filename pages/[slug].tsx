import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Button, ConfirmationPanel, Link } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';

import Skillelinje from '../components/Skillelinje/Skillelinje';

import styles from '../styles/Home.module.css';

import Behandlingsdager from '../components/Behandlingsdager';
import Fravaersperiode from '../components/Fravaersperiode/Fravaersperiode';
import Egenmelding from '../components/Egenmelding';
import Bruttoinntekt from '../components/Bruttoinntekt/Bruttoinntekt';
import RefusjonArbeidsgiver from '../components/RefusjonArbeidsgiver';
import useBoundStore from '../state/useBoundStore';
import Naturalytelser from '../components/Naturalytelser';
import Person from '../components/Person/Person';
import feiltekster from '../utils/feiltekster';
import Feilsammendrag from '../components/Feilsammendrag';
import useValiderInntektsmelding from '../utils/useValiderInntektsmelding';

import useFyllInnsending, { InnsendingSkjema } from '../state/useFyllInnsending';
import BannerUtenVelger from '../components/BannerUtenVelger/BannerUtenVelger';
import useErrorRespons, { ErrorResponse } from '../utils/useErrorResponse';
import environment from '../config/environment';

import Arbeidsgiverperiode from '../components/Arbeidsgiverperiode/Arbeidsgiverperiode';
import useHentKvitteringsdata from '../utils/useHentKvitteringsdata';
import useAmplitude from '../utils/useAmplitude';
import isValidUUID from '../utils/isValidUUID';
import IngenTilgang from '../components/IngenTilgang/IngenTilgang';
import HentingAvDataFeilet from 'components/HentingAvDataFeilet';
import fetchInntektsdata from 'utils/fetchInntektsdata';
import { logger } from '@navikt/next-logger';
import skjemaVariant from 'config/skjemavariant';

const Home: NextPage = () => {
  const router = useRouter();
  const slug = (router.query.slug as string) || '';
  const firstSlug = slug;
  const [pathSlug, setPathSlug] = useState<string>(firstSlug);
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  useEffect(() => {
    setPathSlug(firstSlug);
  }, [firstSlug]);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const [fyllFeilmeldinger, visFeilmeldingsTekst, slettFeilmelding, leggTilFeilmelding] = useBoundStore((state) => [
    state.fyllFeilmeldinger,
    state.visFeilmeldingsTekst,
    state.slettFeilmelding,
    state.leggTilFeilmelding
  ]);

  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const skjemaFeilet = useBoundStore((state) => state.skjemaFeilet);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const setTidligereInntekter = useBoundStore((state) => state.setTidligereInntekter);
  const setSlug = useBoundStore((state) => state.setSlug);
  const setSkjematype = useBoundStore((state) => state.setSkjematype);
  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);
  const logEvent = useAmplitude();

  const validerInntektsmelding = useValiderInntektsmelding();

  const fyllInnsending = useFyllInnsending();

  const errorResponse = useErrorRespons();

  const hentKvitteringsdata = useHentKvitteringsdata();

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.minSideArbeidsgiver;
  };

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: 'Hovedskjema'
    });

    const errorStatus = validerInntektsmelding(opplysningerBekreftet);

    const hasErrors = errorStatus.errorTexts && errorStatus.errorTexts.length > 0;

    if (hasErrors) {
      fyllFeilmeldinger(errorStatus.errorTexts!);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: 'Hovedskjema'
      });
    } else {
      const skjemaData: InnsendingSkjema = fyllInnsending(opplysningerBekreftet);

      fyllFeilmeldinger([]);
      setSenderInn(true);
      const postData = async () => {
        if (isValidUUID(pathSlug)) {
          const data = await fetch(`${environment.innsendingUrl}/${pathSlug}`, {
            method: 'POST',
            body: JSON.stringify(skjemaData),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          setSenderInn(false);

          switch (data.status) {
            case 201:
              router.push(`/kvittering/${pathSlug}`, undefined, { shallow: true });
              break;

            case 500: {
              const errors: Array<ErrorResponse> = [
                {
                  value: 'Innsending av skjema feilet',
                  error: 'Innsending av skjema feilet',
                  property: 'server'
                }
              ];
              errorResponse(errors);

              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet - serverfeil',
                component: 'Hovedskjema'
              });

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
              break;
            }

            case 401: {
              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet - ingen tilgang',
                component: 'Hovedskjema'
              });

              setIngenTilgangOpen(true);
              break;
            }

            default:
              const resultat = await data.json();

              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet',
                component: 'Hovedskjema'
              });

              if (resultat.errors) {
                const errors: Array<ErrorResponse> = resultat.errors;
                errorResponse(errors);
              }
          }
        } else {
          const errors: Array<ErrorResponse> = [
            {
              value: 'Innsending av skjema feilet',
              error: 'Innsending av skjema feilet. Ugyldig identifikator',
              property: 'server'
            }
          ];

          logEvent('skjema validering feilet', {
            tittel: 'Ugyldig UUID ved innsending',
            component: 'Hovedskjema'
          });
          errorResponse(errors);
          setSenderInn(false);

          return false;
        }
      };
      postData();
    }
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  useEffect(() => {
    if (!fravaersperioder) {
      hentKvitteringsdata(pathSlug);
    } else {
      if (bestemmendeFravaersdag) {
        fetchInntektsdata(environment.inntektsdataUrl, slug, bestemmendeFravaersdag)
          .then((inntektSisteTreMnd) => {
            setTidligereInntekter(inntektSisteTreMnd.tidligereInntekter);
          })
          .catch((error) => {
            logger.warn('Feil ved henting av tidliger inntektsdata', error);
          });
      }
    }
    setSlug(pathSlug);
    setSkjematype(skjemaVariant.delvis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <PageContent title='Inntektsmelding'>
        <form className={styles.padded} onSubmit={submitForm}>
          <Person />

          <Behandlingsdager />

          {egenmeldingsperioder && (
            <>
              <Skillelinje />
              <Egenmelding />
            </>
          )}

          <Skillelinje />
          <Fravaersperiode egenmeldingsperioder={egenmeldingsperioder} />

          <Skillelinje />

          <Arbeidsgiverperiode arbeidsgiverperioder={arbeidsgiverperioder} />

          <Skillelinje />

          <Bruttoinntekt bestemmendeFravaersdag={bestemmendeFravaersdag} />

          <Skillelinje />

          <RefusjonArbeidsgiver />

          <Skillelinje />
          <Naturalytelser />
          <ConfirmationPanel
            className={styles.confirmationpanel}
            checked={opplysningerBekreftet}
            onClick={clickOpplysningerBekreftet}
            label='Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
            id='bekreft-opplysninger'
            error={visFeilmeldingsTekst('bekreft-opplysninger')}
          >
            NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene ikke er
            riktige eller fullstendige.
          </ConfirmationPanel>
          <Feilsammendrag />
          <div className={styles.outerbuttonwrapper}>
            <div className={styles.buttonwrapper}>
              <Button className={styles.sendbutton} loading={senderInn}>
                Send
              </Button>

              <Link className={styles.lukkelenke} href={environment.minSideArbeidsgiver}>
                Lukk
              </Link>
            </div>
          </div>
        </form>
        <IngenTilgang open={ingenTilgangOpen} handleCloseModal={() => setIngenTilgangOpen(false)} />
        <HentingAvDataFeilet open={skjemaFeilet} handleCloseModal={lukkHentingFeiletModal} />
      </PageContent>
    </div>
  );
};

export default Home;
