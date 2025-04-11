import { Alert, BodyLong, BodyShort } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { HistoriskInntekt } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import Heading3 from '../Heading3/Heading3';
import TextLabel from '../TextLabel/TextLabel';
import TidligereInntekt from './TidligereInntekt';
import ButtonEndre from '../ButtonEndre';
import formatDate from '../../utils/formatDate';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import logEvent from '../../utils/logEvent';
import Aarsaksvelger from './Aarsaksvelger';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import AvvikAdvarselInntekt from '../AvvikAdvarselInntekt';
import { useFormContext } from 'react-hook-form';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
  sbBruttoinntekt?: number;
  sbTidligereInntekt?: Array<HistoriskInntekt>;
  erSelvbestemt?: boolean;
}

export default function Bruttoinntekt({
  bestemmendeFravaersdag,
  sbBruttoinntekt,
  sbTidligereInntekt,
  erSelvbestemt
}: Readonly<BruttoinntektProps>) {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);
  const [setBareNyMaanedsinntekt, opprinneligbruttoinntekt] = useBoundStore((state) => [
    state.setBareNyMaanedsinntekt,
    state.opprinneligbruttoinntekt
  ]);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);
  const henterData = useBoundStore((state) => state.henterData);
  const feilHentingAvInntektsdata = useBoundStore((state) => state.feilHentingAvInntektsdata);
  const endringAarsak: EndringAarsak | undefined = useBoundStore((state) => state.bruttoinntekt.endringAarsak);
  const amplitudeComponent = 'BeregnetMånedslønn';

  const { watch, setValue } = useFormContext();

  const clickTilbakestillMaanedsinntekt = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Tilbakestill beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setEndreMaanedsinntekt(false);
    setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    setValue('inntekt.endringAarsaker', bruttoinntekt.endringAarsaker ?? []);

    tilbakestillMaanedsinntekt();
  };

  const setEndreMaanedsinntektHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Endre beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setEndreMaanedsinntekt(true);
  };

  const endringAarsaker = watch('inntekt.endringAarsaker');

  useEffect(() => {
    if (endringAarsaker && endringAarsaker.length > 0) {
      setEndreMaanedsinntekt(true);
    }
  }, [endringAarsaker]);

  const endringAvBelop = endreMaanedsinntekt || bruttoinntekt.endringAarsak?.aarsak;

  const gjennomsnittligInntekt = erSelvbestemt
    ? (sbBruttoinntekt ?? bruttoinntekt?.bruttoInntekt)
    : bruttoinntekt?.bruttoInntekt;
  const sisteTreMndTidligereinntekt = erSelvbestemt ? sbTidligereInntekt : tidligereinntekt;

  const harTidligereInntekt = sisteTreMndTidligereinntekt && sisteTreMndTidligereinntekt.length > 0;

  const erBlanktSkjema = false;

  useEffect(() => {
    if (sbBruttoinntekt !== undefined) {
      setBareNyMaanedsinntekt(sbBruttoinntekt);
      setEndreMaanedsinntekt(false);
    }
  }, [sbBruttoinntekt, setBareNyMaanedsinntekt]);

  return (
    <>
      <Heading3 unPadded>Beregnet månedslønn</Heading3>
      <BodyLong spacing={true}>
        Beregnet månedslønn skal som hovedregel være et gjennomsnitt av den inntekten som er rapportert til a-ordningen
        i de tre siste kalendermånedene før sykefraværet startet.
      </BodyLong>
      {feilHentingAvInntektsdata && feilHentingAvInntektsdata.length > 0 && (
        <Alert variant='info'>
          Vi har problemer med å hente inntektsopplysninger akkurat nå. Du kan legge inn beregnet månedslønn selv eller
          forsøke igjen senere.
        </Alert>
      )}
      {harTidligereInntekt && (
        <>
          <BodyLong>
            Vi må vite beregnet månedslønn per {formatDate(bestemmendeFravaersdag)}. Følgende lønnsopplysninger er
            hentet fra a-ordningen:
          </BodyLong>
          <TidligereInntekt tidligereinntekt={sisteTreMndTidligereinntekt} henterData={henterData} />
        </>
      )}
      <AvvikAdvarselInntekt tidligereInntekter={sisteTreMndTidligereinntekt} />
      {!endringAvBelop && !erBlanktSkjema && (
        <TextLabel className={lokalStyles.tbmargin}>Dette gir en beregnet månedslønn på:</TextLabel>
      )}
      <div className={lokalStyles.beloepwrapper}>
        {!endringAvBelop && !erBlanktSkjema && (
          <>
            <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-beloep'>
              {formatCurrency(gjennomsnittligInntekt ?? 0)} kr/måned
            </TextLabel>
            <ButtonEndre
              data-cy='endre-beloep'
              onClick={setEndreMaanedsinntektHandler}
              className={lokalStyles.endrePadding}
            />
          </>
        )}
        {(endringAvBelop || erBlanktSkjema) && (
          <Aarsaksvelger
            bruttoinntekt={bruttoinntekt}
            defaultEndringAarsak={endringAarsak!}
            visFeilmeldingTekst={visFeilmeldingTekst}
            bestemmendeFravaersdag={bestemmendeFravaersdag}
            nyInnsending={nyInnsending && skjemastatus !== 'SELVBESTEMT'}
            clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
            kanIkkeTilbakestilles={erBlanktSkjema}
          />
        )}
      </div>
      <BodyShort className={lokalStyles.bruttoinntektBelopBeskrivelse}>Stemmer dette?</BodyShort>
      <BodyLong>
        Månedinntekten du oppgir i inntektsmeldingen skal reflektere den ansatte sitt inntektstap i sykefraværsperioden.
        Du må derfor sjekke at vårt forslag stemmer. Hvis den ansatte i løpet av beregningsperioden har fått en varig
        lønnsøkning, endring i arbeidstid, hatt ubetalt fri som permisjon, ferie, sykefravær eller permittering, må vårt
        forslag til månedsinntekt endres. Les mer om{' '}
        <LenkeEksternt href='https://www.nav.no/arbeidsgiver/inntektsmelding#beregningsregler-for-sykepenger'>
          beregning av månedslønn
        </LenkeEksternt>
        .
      </BodyLong>
    </>
  );
}
