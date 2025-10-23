import { Alert, BodyLong, BodyShort } from '@navikt/ds-react';
import { useEffect, useMemo, useState } from 'react';
import { HistoriskInntekt } from '../../schema/HistoriskInntektSchema';
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
import AvvikAdvarselInntekt from '../AvvikAdvarselInntekt';
import { useFormContext } from 'react-hook-form';
import { harEndringAarsak } from '../../utils/harEndringAarsak';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
  sbBruttoinntekt?: number;
  sbTidligereInntekt?: HistoriskInntekt;
  erSelvbestemt?: boolean;
}

export default function Bruttoinntekt({
  bestemmendeFravaersdag,
  sbBruttoinntekt,
  sbTidligereInntekt,
  erSelvbestemt
}: Readonly<BruttoinntektProps>) {
  const [requestEndreMaanedsinntekt, setRequestEndreMaanedsinntekt] = useState<boolean>(false);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: HistoriskInntekt | undefined = useBoundStore((state) => state.tidligereInntekt);
  const [setBareNyMaanedsinntekt] = useBoundStore((state) => [state.setBareNyMaanedsinntekt]);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);
  const henterData = useBoundStore((state) => state.henterData);
  const amplitudeComponent = 'BeregnetMånedslønn';

  const { watch, setValue } = useFormContext();
  const feilHentingAvInntektsdata = tidligereinntekt === null;

  const arrayTidligereInntekt: [string, number | null][] = sbTidligereInntekt
    ? Object.entries(sbTidligereInntekt).map(([key, value]) => [key, value] as [string, number | null])
    : [];

  const handleResetMaanedsinntekt = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Tilbakestill beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setRequestEndreMaanedsinntekt(false);
    setValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    setValue('inntekt.endringAarsaker', bruttoinntekt.endringAarsaker ?? []);

    tilbakestillMaanedsinntekt();
  };

  const handleStartEditingMaanedsinntekt = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Endre beregnet månedsinntekt',
      component: amplitudeComponent
    });
    setRequestEndreMaanedsinntekt(true);
  };

  const endringAarsaker = watch('inntekt.endringAarsaker');

  // useEffect(() => {
  //   if (harEndringAarsak(endringAarsaker)) {
  //     setRequestEndreMaanedsinntekt(true);
  //   }
  // }, [endringAarsaker]);

  const gjennomsnittligInntekt = erSelvbestemt
    ? (sbBruttoinntekt ?? bruttoinntekt?.bruttoInntekt)
    : bruttoinntekt?.bruttoInntekt;
  const sisteTreMndTidligereinntekt = erSelvbestemt ? new Map(arrayTidligereInntekt) : tidligereinntekt;

  const harTidligereInntekt = sisteTreMndTidligereinntekt && sisteTreMndTidligereinntekt.size > 0;

  const erBlanktSkjema = false;

  useEffect(() => {
    if (sbBruttoinntekt !== undefined) {
      setBareNyMaanedsinntekt(sbBruttoinntekt);
    }
  }, [sbBruttoinntekt, setBareNyMaanedsinntekt]);

  const endreMaanedsinntekt = useMemo(() => {
    if (harEndringAarsak(endringAarsaker)) {
      return true;
    }
    return requestEndreMaanedsinntekt;
  }, [requestEndreMaanedsinntekt, endringAarsaker]);

  return (
    <>
      <Heading3 unPadded>Beregnet månedslønn</Heading3>
      <BodyLong spacing={true}>
        Beregnet månedslønn skal som hovedregel være et gjennomsnitt av den inntekten som er rapportert til a-ordningen
        i de tre siste kalendermånedene før sykefraværet startet.
      </BodyLong>
      {feilHentingAvInntektsdata && (
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
      {!endreMaanedsinntekt && !erBlanktSkjema && (
        <TextLabel className={lokalStyles.tbmargin}>Dette gir en beregnet månedslønn på:</TextLabel>
      )}
      <div className={lokalStyles.beloepwrapper}>
        {!endreMaanedsinntekt && !erBlanktSkjema && (
          <>
            <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-beloep'>
              {formatCurrency(gjennomsnittligInntekt ?? 0)} kr/måned
            </TextLabel>
            <ButtonEndre
              data-cy='endre-beloep'
              onClick={handleStartEditingMaanedsinntekt}
              className={lokalStyles.endrePadding}
            />
          </>
        )}
        {(endreMaanedsinntekt || erBlanktSkjema) && (
          <Aarsaksvelger
            bruttoinntekt={bruttoinntekt}
            visFeilmeldingTekst={visFeilmeldingTekst}
            bestemmendeFravaersdag={bestemmendeFravaersdag}
            nyInnsending={nyInnsending && skjemastatus !== 'SELVBESTEMT'}
            handleResetMaanedsinntekt={handleResetMaanedsinntekt}
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
