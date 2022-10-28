import { NextPage } from 'next';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
import styles from '../../styles/Home.module.css';

import Heading2 from '../../components/Heading2/Heading2';
import Heading3 from '../../components/Heading3/Heading3';
import { BodyShort, Button } from '@navikt/ds-react';
import TextLabel from '../../components/TextLabel/TextLabel';
import Skillelinje from '../../components/Skillelinje/Skillelinje';
import Link from 'next/link';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';
import formatCurrency from '../../utils/formatCurrency';
import { useRouter } from 'next/router';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import FullLonnIArbeidsgiverperioden from '../../components/FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';

import subDays from 'date-fns/subDays';
import useBoundStore from '../../state/useBoundStore';
import { IArbeidsforhold } from '../../state/state';

const Kvittering: NextPage = () => {
  const orgnrUnderenhet = useBoundStore((state) => state.orgnrUnderenhet);
  const virksomhetsnavn = useBoundStore((state) => state.virksomhetsnavn);
  const identitetsnummer = useBoundStore((state) => state.identitetsnummer);
  const navn = useBoundStore((state) => state.navn);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt.bruttoInntekt);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperiode = useBoundStore((state) => state.fravaersperiode);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const aktiveArbeidsforhold = useBoundStore((state) => state.aktiveArbeidsforhold);
  const arbeidsforhold = useBoundStore((state) => state.arbeidsforhold);

  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);

  const aktiveArbeidsforholdListe = aktiveArbeidsforhold();
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const state = {
    virksomhetsnavn,
    orgnrUnderenhet,
    identitetsnummer,
    navn,
    egenmeldingsperioder,
    fravaersperiode,
    arbeidsgiverperiode: [
      {
        fra: subDays(new Date(), 14),
        til: new Date()
      }
    ],
    bruttoinntekt,
    naturalytelser,
    fullLonnIArbeidsgiverPerioden,
    lonnISykefravaeret
  };

  const flerEnnEtArbeidsforhold = aktiveArbeidsforholdListe.length > 1;

  const router = useRouter();

  const clickEndre = () => {
    router.push('/');
  };

  console.log('arbeidsforhold', arbeidsforhold);

  const aktuelltArbeidsforhold = (arbeidsforholdId: string) =>
    arbeidsforhold?.find((element) => element.arbeidsforholdId === arbeidsforholdId);

  return (
    <div className={styles.container}>
      <Head>
        <title>Inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Sykepenger'} />
      <div>
        <PageContent title='Kvittering - innsendt inntektsmelding'>
          <main className={`main-content ${styles.padded}`}>
            <div className={styles.personinfowrapper}>
              <div className={styles.denansatte}>
                <Heading2>Den ansatte</Heading2>
                <div className={lokalStyles.ytreansattwrapper}>
                  <div className={lokalStyles.ansattwrapper}>
                    <TextLabel>Navn</TextLabel>
                    <div className={styles.fnr}>{navn}</div>
                  </div>
                  <div className={styles.ansattwrapper}>
                    <TextLabel>Fødselsnummer</TextLabel>
                    <div className={styles.fnr}>{identitetsnummer}</div>
                  </div>
                </div>
              </div>
              <div className={styles['size-resten']}>
                <Heading2>Arbeidsgiveren</Heading2>
                <div className={styles.arbeidsgiverwrapper}>
                  <div className={styles.virksomhetsnavnwrapper}>
                    <TextLabel>Virksomhetsnavn</TextLabel>
                    <div className={styles.virksomhetsnavn}>{virksomhetsnavn}</div>
                  </div>
                  <div className={styles.orgnrnavnwrapper}>
                    <TextLabel>Org.nr. for underenhet</TextLabel>
                    {orgnrUnderenhet}
                  </div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Sykmeldingsperiode</Heading2>
            <div className={lokalStyles.ytterstefravaerwrapper}>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Egenmelding
                </BodyShort>
                {egenmeldingsperioder &&
                  aktiveArbeidsforholdListe &&
                  aktiveArbeidsforholdListe.map((forhold) =>
                    egenmeldingsperioder[forhold.arbeidsforholdId].map((periode, index) => (
                      <PeriodeFraTil
                        fra={periode.fra!}
                        til={periode.til!}
                        key={'egenmelding' + index + '-' + forhold.arbeidsforholdId}
                      />
                    ))
                  )}
              </div>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Bestemmende fraværsdag
                </BodyShort>
                <div className={lokalStyles.fravaerwrapper}>
                  <div className={lokalStyles.fravaertid}>Dato</div>
                  <div>22.22.2022</div>
                </div>
              </div>
            </div>
            <div className={lokalStyles.ytterstefravaerwrapper}>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Fravær knyttet til sykmelding
                </BodyShort>
                {aktiveArbeidsforholdListe &&
                  fravaersperiode &&
                  aktiveArbeidsforholdListe.map((forhold) =>
                    fravaersperiode[forhold.arbeidsforholdId].map((periode, index) => (
                      <PeriodeFraTil
                        fra={periode.fra!}
                        til={periode.til!}
                        key={'fperiode' + index + '-' + forhold.arbeidsforholdId}
                      />
                    ))
                  )}
              </div>
              <div className={lokalStyles.ytrefravaerswrapper}>
                <BodyShort as='h4' className={lokalStyles.fravaerstyper}>
                  Arbeidsgiverperiode
                </BodyShort>
                {state.arbeidsgiverperiode.map((periode, index) => (
                  <PeriodeFraTil fra={periode.fra} til={periode.til} key={index} />
                ))}
              </div>
            </div>
            <Skillelinje />
            <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
            <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
            <BodyShort>{formatCurrency(state.bruttoinntekt)} kr/måned</BodyShort>
            <Skillelinje />
            {!flerEnnEtArbeidsforhold && <Heading2>Refusjon</Heading2>}
            {arbeidsforhold &&
              aktiveArbeidsforholdListe.map((aktivtArbeidsforhold) => (
                <>
                  {flerEnnEtArbeidsforhold && (
                    <Heading2>
                      Refusjon - {aktuelltArbeidsforhold(aktivtArbeidsforhold as undefined as string).arbeidsforhold}
                    </Heading2>
                  )}
                  <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
                  <FullLonnIArbeidsgiverperioden
                    lonnIPerioden={fullLonnIArbeidsgiverPerioden!}
                    arbeidsforhold={aktivtArbeidsforhold}
                  />
                  <Heading3>Betaler arbeidsgiver lønn under hele eller deler av sykefraværet?</Heading3>
                  <LonnUnderSykefravaeret
                    lonn={state.lonnISykefravaeret!}
                    arbeidsforhold={aktivtArbeidsforhold}
                    refusjonskravetOpphoerer={refusjonskravetOpphoerer}
                  />
                </>
              ))}
            <Skillelinje />
            <Heading2>Eventuelle naturalytelser</Heading2>
            <BortfallNaturalytelser ytelser={naturalytelser!} />
            <Skillelinje />
            <BodyShort>Kvittering - innsendt inntektsmelding - 12.05.2021 kl. 12.23</BodyShort>
            <div className={lokalStyles.buttonwrapper}>
              <div className={lokalStyles.innerbuttonwrapper}>
                <Button variant='secondary' onClick={clickEndre}>
                  Endre
                </Button>
                <Link className={lokalStyles.lukkelenke} href='/'>
                  <a className={lokalStyles.lukkelenke}>Lukk</a>
                </Link>
              </div>
              <Button className={lokalStyles.skrivutknapp} variant='tertiary'>
                Skriv ut
              </Button>
            </div>
          </main>
        </PageContent>
      </div>
    </div>
  );
};

export default Kvittering;
