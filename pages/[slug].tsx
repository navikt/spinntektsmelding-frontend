import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Button, ConfirmationPanel } from '@navikt/ds-react';

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
import formatIsoDate from '../utils/formatIsoDate';
import BannerUtenVelger from '../components/BannerUtenVelger/BannerUtenVelger';
import useErrorRespons, { ErrorResponse } from '../utils/useErrorResponse';
import environment from '../config/environment';

import Arbeidsgiverperiode from '../components/Arbeidsgiverperiode/Arbeidsgiverperiode';
import useHentSkjemadata from '../utils/useHentSkjemadata';

const Home: NextPage = () => {
  const router = useRouter();
  const slug = (router.query.slug as string) || '';
  const firstSlug = slug;
  const [pathSlug, setPathSlug] = useState<string>(firstSlug);

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

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);

  const [opplysningerBekreftet, setOpplysningerBekreftet] = useState<boolean>(false);

  const validerInntektsmelding = useValiderInntektsmelding();

  const fyllInnsending = useFyllInnsending();

  const errorResponse = useErrorRespons();

  const hentSkjemadata = useHentSkjemadata();

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();

    const errorStatus = validerInntektsmelding(opplysningerBekreftet);

    if (errorStatus.errorTexts && errorStatus.errorTexts.length > 0) {
      fyllFeilmeldinger(errorStatus.errorTexts);
    } else {
      const skjemaData: InnsendingSkjema = fyllInnsending(opplysningerBekreftet);
      skjemaData.bestemmendeFraværsdag = formatIsoDate(bestemmendeFravaersdag);
      skjemaData.arbeidsgiverperioder = arbeidsgiverperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      }));
      fyllFeilmeldinger([]);
      const postData = async () => {
        const data = await fetch(environment.innsendingUrl, {
          method: 'POST',
          body: JSON.stringify(skjemaData),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        switch (data.status) {
          case 201:
            router.push(`/kvittering/${pathSlug}`, undefined, { shallow: true });
            break;

          case 500:
            const errors: Array<ErrorResponse> = [
              {
                value: 'Innsending av skjema feilet',
                error: 'Innsending av skjema feilet',
                property: 'server'
              }
            ];
            errorResponse(errors);
            break;

          default:
            const resultat = await data.json();

            if (resultat.errors) {
              const errors: Array<ErrorResponse> = resultat.errors;
              errorResponse(errors);
            }
        }
      };
      postData();
    }
  };

  const clickOpplysningerBekreftet = (event: React.MouseEvent<HTMLInputElement>) => {
    setOpplysningerBekreftet(!!event.currentTarget.checked);
    if (!!event.currentTarget.checked) {
      slettFeilmelding('bekreft-opplysninger');
    } else {
      leggTilFeilmelding('bekreft-opplysninger', feiltekster.BEKREFT_OPPLYSNINGER);
    }
  };

  useEffect(() => {
    hentSkjemadata(pathSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSlug]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div>
        <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
        <PageContent title='Inntektsmelding'>
          <div>
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
                NAV kan trekke tilbake retten til å få dekket sykepengene i arbeidsgiverperioden hvis opplysningene ikke
                er riktige eller fullstendige.
              </ConfirmationPanel>
              <Feilsammendrag />
              <Button className={styles.sendbutton}>Send</Button>
            </form>
          </div>
        </PageContent>
      </div>
    </div>
  );
};

export default Home;
