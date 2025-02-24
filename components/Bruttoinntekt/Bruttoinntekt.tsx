import { Alert, BodyLong, BodyShort } from '@navikt/ds-react';
import { ChangeEvent, useEffect, useState } from 'react';
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
import { InformationSquareIcon } from '@navikt/aksel-icons';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
  setIsDirtyForm: (dirty: boolean) => void;
  sbBruttoinntekt?: number;
  sbTidligereInntekt?: Array<HistoriskInntekt>;
  erSelvbestemt?: boolean;
}

export default function Bruttoinntekt({
  bestemmendeFravaersdag,
  setIsDirtyForm,
  sbBruttoinntekt,
  sbTidligereInntekt,
  erSelvbestemt
}: Readonly<BruttoinntektProps>) {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);
  const [setNyMaanedsinntektOgRefusjonsbeloep, setBareNyMaanedsinntekt] = useBoundStore((state) => [
    state.setNyMaanedsinntektOgRefusjonsbeloep,
    state.setBareNyMaanedsinntekt
  ]);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const setPerioder = useBoundStore((state) => state.setPerioder);
  const setEndringAarsakGjelderFra = useBoundStore((state) => state.setEndringAarsakGjelderFra);
  const setEndringAarsakBleKjent = useBoundStore((state) => state.setEndringAarsakBleKjent);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);
  const henterData = useBoundStore((state) => state.henterData);
  const feilHentingAvInntektsdata = useBoundStore((state) => state.feilHentingAvInntektsdata);
  const endringAarsak: EndringAarsak | undefined = useBoundStore((state) => state.bruttoinntekt.endringAarsak);
  const amplitudeComponent = 'BeregnetMånedslønn';

  const clickTilbakestillMaanedsinntekt = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Tilbakestill beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setEndreMaanedsinntekt(false);
    tilbakestillMaanedsinntekt();
  };

  const changeMaanedsintektHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setNyMaanedsinntektOgRefusjonsbeloep(event.target.value);
  };

  const changeBegrunnelseHandler = (aarsak: string) => {
    logEvent('filtervalg', {
      tittel: 'Endringsårsak beregnet månedsinntekt',
      component: amplitudeComponent,
      kategori: aarsak,
      filternavn: 'Endringsårsak beregnet månedsinntekt'
    });

    setEndringsaarsak(aarsak);
  };

  const addIsDirtyForm = (fn: (param: any) => void) => {
    return (param: any) => {
      setIsDirtyForm(true);
      fn(param);
    };
  };

  const setEndreMaanedsinntektHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Endre beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setEndreMaanedsinntekt(true);
  };

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
        Beregnet månedslønn skal som hovedregel fastsettes ut fra et gjennomsnitt av den inntekten som er rapportert til
        a-ordningen i de tre siste kalendermånedene før sykefraværet startet. Beregningen skal følge{' '}
        <LenkeEksternt href='https://lovdata.no/nav/folketrygdloven/kap8/%C2%A78-28'>
          folketrygdloven §8-28
        </LenkeEksternt>
        .
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
            Vi må vite beregnet månedslønn for {formatDate(bestemmendeFravaersdag)}. Følgende lønnsopplysninger er
            hentet fra A-ordningen:
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
            changeMaanedsintektHandler={addIsDirtyForm(changeMaanedsintektHandler)}
            changeBegrunnelseHandler={addIsDirtyForm(changeBegrunnelseHandler)}
            defaultEndringAarsak={endringAarsak!}
            setEndringAarsakGjelderFra={addIsDirtyForm(setEndringAarsakGjelderFra)}
            setEndringAarsakBleKjent={addIsDirtyForm(setEndringAarsakBleKjent)}
            setPerioder={addIsDirtyForm(setPerioder)}
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
        <InformationSquareIcon title='Til informasjon' /> Sjekk nøye at beregnet månedslønn er korrekt. Hvis den ansatte
        nylig har fått lønnsøkning, endring i arbeidstid, hatt ubetalt fri eller har andre endringer i lønn må dette
        regnes med. Overtid skal ikke inkluderes i beregnet månedslønn.
      </BodyLong>
    </>
  );
}
