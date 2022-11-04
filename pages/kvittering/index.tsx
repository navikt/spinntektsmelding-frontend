import { NextPage } from 'next';
import Head from 'next/head';
import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import PageContent from '../../components/PageContent/PageContent';

import lokalStyles from './Kvittering.module.css';
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
import Heading4 from '../../components/Heading4';
import { IArbeidsforhold } from '../../state/state';
import KvitteringArbeidsforholdBruttolonn from '../../components/KvitteringArbeidsforholdBruttolonn';

const Kvittering: NextPage = () => {
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt.bruttoInntekt);
  const inntektsprosent = useBoundStore((state) => state.inntektsprosent);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const fravaersperiode = useBoundStore((state) => state.fravaersperiode);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const aktiveArbeidsforhold = useBoundStore((state) => state.aktiveArbeidsforhold);
  const arbeidsforhold = useBoundStore((state) => state.arbeidsforhold);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);

  const aktiveArbeidsforholdListe = aktiveArbeidsforhold();
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const flerEnnEtArbeidsforhold = aktiveArbeidsforholdListe.length > 1;
  const arbeidsgiverperiode = [{ fra: new Date(1, 9, 2021), til: new Date(16, 10, 2021) }];

  const router = useRouter();

  const clickEndre = () => {
    router.push('/');
  };

  const aktuelltArbeidsforholdTittel = (arbeidsforholdId?: IArbeidsforhold) => {
    if (!arbeidsforholdId) {
      return '';
    }
    const aktuelltArbeidsforhold = arbeidsforhold?.find(
      (element) => element.arbeidsforholdId === arbeidsforholdId.arbeidsforholdId
    );

    return aktuelltArbeidsforhold ? aktuelltArbeidsforhold.arbeidsforhold : '';
  };

  const harAktiveEgenmeldingsperioder = () => {
    const periodeKeys = Object.keys(egenmeldingsperioder);
    const egenmeldinger = periodeKeys.filter((arbeidstaker) => {
      const perioder = egenmeldingsperioder[arbeidstaker];
      return perioder.find((periode) => periode.fra || periode.til);
    });

    return egenmeldinger.length > 0;
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
        <PageContent title='Kvittering - innsendt inntektsmelding'>
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
                        aktiveArbeidsforholdListe &&
                        aktiveArbeidsforholdListe.map((forhold) => (
                          <>
                            {flerEnnEtArbeidsforhold && (
                              <Heading4 className={lokalStyles.arbeidsforhold}>
                                {aktuelltArbeidsforholdTittel(forhold)}
                              </Heading4>
                            )}
                            {egenmeldingsperioder[forhold.arbeidsforholdId].map((periode, index) => (
                              <PeriodeFraTil
                                fra={periode.fra!}
                                til={periode.til!}
                                key={'egenmelding' + index + '-' + forhold.arbeidsforholdId}
                              />
                            ))}
                          </>
                        ))}
                    </div>
                  )}
                </div>
                <div className={lokalStyles.ytterstefravaerwrapper}>
                  <div className={lokalStyles.ytrefravaerswrapper}>
                    <Heading3 className={lokalStyles.sykfravaerstyper}>Sykmelding</Heading3>
                    {aktiveArbeidsforholdListe &&
                      fravaersperiode &&
                      aktiveArbeidsforholdListe.map((forhold) => (
                        <>
                          {flerEnnEtArbeidsforhold && (
                            <Heading4 className={lokalStyles.arbeidsforhold}>
                              {aktuelltArbeidsforholdTittel(forhold)}
                            </Heading4>
                          )}
                          {fravaersperiode[forhold.arbeidsforholdId].map((periode, index) => (
                            <PeriodeFraTil
                              fra={periode.fra!}
                              til={periode.til!}
                              key={'fperiode' + index + '-' + forhold.arbeidsforholdId}
                            />
                          ))}
                        </>
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
                      <div>22.22.2022</div>
                    </div>
                  </div>
                  <div className={lokalStyles.arbeidsgiverperiode}>
                    <Heading2 className={lokalStyles.fravaerstyper}>Arbeidsgiverperiode</Heading2>
                    <BodyLong>
                      Arbeidsgiver er ansvarlig å betale ut lønn til den sykmeldte under arbeidsgiverpeioden, etterpå
                      betaler Nav lønn til den syke eller refunderer bedriften:
                    </BodyLong>
                    {arbeidsgiverperiode.map((periode, index) => (
                      <PeriodeFraTil fra={periode.fra} til={periode.til} key={index} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Skillelinje />
            <Heading2>Bruttoinntekt siste 3 måneder</Heading2>
            <BodyShort className={lokalStyles.fravaertid}>Registrert inntekt</BodyShort>
            <BodyShort>{formatCurrency(bruttoinntekt)} kr/måned</BodyShort>
            <KvitteringArbeidsforholdBruttolonn
              lonnPrArbeidsforhold={inntektsprosent}
              arbeidsforhold={aktiveArbeidsforholdListe}
            />
            <Skillelinje />
            {!flerEnnEtArbeidsforhold && <Heading2>Refusjon</Heading2>}
            {arbeidsforhold &&
              aktiveArbeidsforholdListe.map((aktivtArbeidsforhold: IArbeidsforhold) => (
                <>
                  {flerEnnEtArbeidsforhold && (
                    <Heading2 className={lokalStyles.refusjonsheader}>
                      Refusjon - {aktuelltArbeidsforholdTittel(aktivtArbeidsforhold)}
                    </Heading2>
                  )}
                  <Heading3>Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?</Heading3>
                  <FullLonnIArbeidsgiverperioden
                    lonnIPerioden={fullLonnIArbeidsgiverPerioden!}
                    arbeidsforhold={aktivtArbeidsforhold}
                  />
                  <Heading3>Betaler arbeidsgiver lønn under hele eller deler av sykefraværet?</Heading3>
                  <LonnUnderSykefravaeret
                    lonn={lonnISykefravaeret!}
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
