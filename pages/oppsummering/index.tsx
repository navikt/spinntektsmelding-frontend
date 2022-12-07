import { NextPage } from 'next';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Oppsummering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import Heading3 from '../../components/Heading3/Heading3';
import { BodyLong, BodyShort, Button } from '@navikt/ds-react';
import Person from '../../components/Person/Person';

import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter } from 'next/router';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import useBoundStore from '../../state/useBoundStore';

import finnBestemmendeFravaersdag from '../../utils/finnBestemmendeFravaersdag';
import { parseISO } from 'date-fns';
import finnArbeidsgiverperiode from '../../utils/finnArbeidsgiverperiode';
import ButtonEndre from '../../components/ButtonEndre';
import EndrePerioderModal, { EndrePeriodeRespons } from '../../components/EndrePerioderModal/EndrePerioderModal';
import { useEffect, useState } from 'react';
import formatDate from '../../utils/formatDate';
import useValiderInntektsmelding from '../../utils/useValiderInntektsmelding';
import useFyllInnsending, { InnsendingSkjema } from '../../state/useFyllInnsending';
import formatIsoDate from '../../utils/formatIsoDate';

const INNSENDING_URL = '/im-dialog/api/innsendingInntektsmelding';

const Oppsummering: NextPage = () => {
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt.bruttoInntekt);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);

  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useBoundStore((state) => [
    state.arbeidsgiverperioder,
    state.setArbeidsgiverperioder
  ]);
  const [bestemmendeFravaersdag, setBestemmendeFravaersdag] = useBoundStore((state) => [
    state.bestemmendeFravaersdag,
    state.setBestemmendeFravaersdag
  ]);
  const setEndringsbegrunnelse = useBoundStore((state) => state.setEndringsbegrunnelse);
  const validerInntektsmelding = useValiderInntektsmelding();
  const fyllInnsending = useFyllInnsending();

  const router = useRouter();

  const clickEndre = () => {
    router.push('/');
  };

  const sendSkjema = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const opplysningerBekreftet = true;
    const errorStatus = validerInntektsmelding(opplysningerBekreftet);

    if (!(errorStatus.errorTexts && errorStatus.errorTexts.length > 0)) {
      router.push('/oppsummering');
      const skjemaData: InnsendingSkjema = fyllInnsending(opplysningerBekreftet);
      skjemaData.bestemmendeFraværsdag = formatIsoDate(bestemmendeFravaersdag);
      skjemaData.arbeidsgiverperioder = arbeidsgiverperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      }));
      fyllFeilmeldinger([]);
      const postData = async () => {
        const data = await fetch(INNSENDING_URL, {
          method: 'POST',
          body: JSON.stringify(skjemaData),
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        console.log(data); // eslint-disable-line
        if (data.status === 201) {
          router.push('/kvittering');
        }
      };
      postData();
    } else {
      fyllFeilmeldinger(errorStatus.errorTexts);
    }
  };

  useEffect(() => {
    if (fravaersperioder) {
      const perioder = fravaersperioder.concat(egenmeldingsperioder);
      setBestemmendeFravaersdag(parseISO(finnBestemmendeFravaersdag(perioder) as unknown as string));
      setArbeidsgiverperioder(finnArbeidsgiverperiode(perioder));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fravaersperioder, egenmeldingsperioder]);

  const harAktiveEgenmeldingsperioder = () => {
    return egenmeldingsperioder.find((periode) => periode.fom || periode.tom) !== undefined;
  };

  const onUpdatePeriodeModal = (data: EndrePeriodeRespons) => {
    setModalOpen(false);
    setBestemmendeFravaersdag(data.bestemmendFraværsdag);
    setArbeidsgiverperioder(data.arbeidsgiverperioder);
    setEndringsbegrunnelse(data.begrunnelse);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <div>
        <PageContent title='Oppsummering - innsendt inntektsmelding'>
          <main className={`main-content ${styles.padded}`}>
            <Person />

            <Skillelinje />
            <div className={lokalStyles.fravaerswrapperwrapper}>
              <div className={lokalStyles.fravaersperiode}>
                <Heading2>Fraværsperiode</Heading2>
                <div className={lokalStyles.ytterstefravaerwrapper}>
                  {harAktiveEgenmeldingsperioder() && (
                    <div className={lokalStyles.ytrefravaerswrapper}>
                      <Heading3 className={lokalStyles.sykfravaerstyper}>Egenmelding</Heading3>
                      {egenmeldingsperioder &&
                        egenmeldingsperioder.map((periode, index) => (
                          <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'egenmelding' + index} />
                        ))}
                    </div>
                  )}
                </div>
                <div className={lokalStyles.ytterstefravaerwrapper}>
                  <div className={lokalStyles.ytrefravaerswrapper}>
                    <Heading3 className={lokalStyles.sykfravaerstyper}>Sykmelding</Heading3>
                    {fravaersperioder &&
                      fravaersperioder.map((periode, index) => (
                        <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'fperiode' + index} />
                      ))}
                  </div>
                </div>
              </div>
              <div className={lokalStyles.infoboks}>
                <div className={lokalStyles.ytterstefravaerwrapper}>
                  <div className={lokalStyles.ytrefravaerswrapper}>
                    <Heading2 className={lokalStyles.fravaerstyper}>Bestemmende fraværsdag</Heading2>
                    <BodyLong>Bestemmende fraværsdag angir den dato som sykelønn skal beregnes utfra.</BodyLong>
                    <div className={lokalStyles.fravaerwrapper}>
                      <div className={lokalStyles.fravaertid}>Dato</div>
                      <div>{formatDate(bestemmendeFravaersdag)} </div>
                    </div>
                  </div>
                  <div className={lokalStyles.arbeidsgiverperiode}>
                    <Heading2 className={lokalStyles.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                    <BodyLong>
                      Arbeidsgiver er ansvarlig å betale ut lønn til den sykmeldte under arbeidsgiverpeioden, etterpå
                      betaler Nav lønn til den syke eller refunderer bedriften:
                    </BodyLong>
                    {arbeidsgiverperioder &&
                      arbeidsgiverperioder.map((periode, index) => (
                        <PeriodeFraTil fom={periode.fom} tom={periode.tom} key={index} />
                      ))}
                    <div className={lokalStyles.endrewrapper}>
                      <ButtonEndre onClick={() => setModalOpen(true)} />
                      <BodyLong>
                        *Hvis du mener at bestemmende fraværsdag eller arbeidsgiverperioden er feil er det mulig å
                        korrigere.
                      </BodyLong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
            <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
            <BodyShort>{formatCurrency(bruttoinntekt)} kr/måned</BodyShort>
            <Skillelinje />
            <Heading2>Refusjon</Heading2>

            <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
            <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverPerioden!} />
            <Heading3>Betaler arbeidsgiver lønn etter arbeidsgiverperioden?</Heading3>
            <LonnUnderSykefravaeret lonn={lonnISykefravaeret!} refusjonskravetOpphoerer={refusjonskravetOpphoerer} />

            <Skillelinje />
            <Heading2>Eventuelle naturalytelser</Heading2>
            <BortfallNaturalytelser ytelser={naturalytelser!} />
            <Skillelinje />

            <div className={lokalStyles.buttonwrapper + ' skjul-fra-print'}>
              <div className={lokalStyles.innerbuttonwrapper}>
                <Button variant='secondary' onClick={clickEndre}>
                  Tilbake
                </Button>
                <Button variant='primary' onClick={sendSkjema}>
                  Send inn
                </Button>
                <Link className={lokalStyles.lukkelenke} href='/'>
                  <a className={lokalStyles.lukkelenke}>Lukk</a>
                </Link>
              </div>
            </div>
          </main>
        </PageContent>
      </div>
      {arbeidsgiverperioder && bestemmendeFravaersdag && (
        <EndrePerioderModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          arbeidsgiverperioder={arbeidsgiverperioder}
          bestemmendeFravaersdag={bestemmendeFravaersdag}
          onUpdate={onUpdatePeriodeModal}
        />
      )}
    </div>
  );
};

export default Oppsummering;
