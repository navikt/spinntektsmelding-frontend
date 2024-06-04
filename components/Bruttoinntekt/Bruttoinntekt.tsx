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
import LesMer from '../LesMer';
import logEvent from '../../utils/logEvent';
import Aarsaksvelger from './Aarsaksvelger';
import { EndringAarsak } from '../../validators/validerAapenInnsending';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
  setIsDirtyForm: (dirty: boolean) => void;
  sbBruttoinntekt?: number;
  sbTidligereinntekt?: Array<HistoriskInntekt>;
  erSelvbestemt?: boolean;
}

export default function Bruttoinntekt({
  bestemmendeFravaersdag,
  setIsDirtyForm,
  sbBruttoinntekt,
  sbTidligereinntekt,
  erSelvbestemt
}: BruttoinntektProps) {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);
  const [setNyMaanedsinntektOgRefusjonsbeloep, setBareNyMaanedsinntekt] = useBoundStore((state) => [
    state.setNyMaanedsinntektOgRefusjonsbeloep,
    state.setBareNyMaanedsinntekt
  ]);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const setPerioder = useBoundStore((state) => state.setPerioder);
  const setEndringAarsakGjelderFra = useBoundStore((state) => state.setEndringAarsakGjelderFra);
  const setEndringAarsakBleKjent = useBoundStore((state) => state.setEndringAarsakBleKjent);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const henterData = useBoundStore((state) => state.henterData);
  const feilHentingAvInntektsdata = useBoundStore((state) => state.feilHentingAvInntektsdata);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);
  const endringAarsak: EndringAarsak = useBoundStore((state) => state.bruttoinntekt.endringAarsak);
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

  const clickLesMerBeregnetMaanedslonn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent(readMoreOpen ? 'readmore lukket' : 'readmore åpnet', {
      tittel: 'Les mer beregnet månedsinntekt',
      component: amplitudeComponent
    });

    setReadMoreOpen(!readMoreOpen);
  };

  const endringAvBelop = endreMaanedsinntekt || bruttoinntekt.endringAarsak?.aarsak;
  const [readMoreOpen, setReadMoreOpen] = useState<boolean>(false);

  const gjennomsnittligInntekt = erSelvbestemt ? sbBruttoinntekt : bruttoinntekt?.bruttoInntekt;
  const sisteTreMndTidligereinntekt = erSelvbestemt ? sbTidligereinntekt : tidligereinntekt;

  const erFeriemaaneder = sjekkOmFerieMaaneder(sisteTreMndTidligereinntekt);

  const harTidligereInntekt = sisteTreMndTidligereinntekt && sisteTreMndTidligereinntekt.length > 0;

  const manglendeEller0FraAmeldingen =
    !sisteTreMndTidligereinntekt || sisteTreMndTidligereinntekt?.filter((inntekt) => !inntekt.inntekt).length > 0;

  const erBlanktSkjema = false; // skjemastatus === SkjemaStatus.SELVBESTEMT;

  useEffect(() => {
    if (sbBruttoinntekt !== undefined) {
      console.log('sbBruttoinntekt endret', sbBruttoinntekt);
      setBareNyMaanedsinntekt(sbBruttoinntekt);
      setEndreMaanedsinntekt(false);
    }
  }, [sbBruttoinntekt]);

  return (
    <>
      <Heading3 unPadded>Beregnet månedslønn</Heading3>
      <LesMer header='Informasjon om beregnet månedslønn' open={readMoreOpen} onClick={clickLesMerBeregnetMaanedslonn}>
        Beregnet månedslønn skal som hovedregel fastsettes ut fra et gjennomsnitt av den inntekten som er rapportert til
        a-ordningen i de 3 siste kalendermånedene før sykefraværet startet.{' '}
        <LenkeEksternt
          href='https://www.nav.no/arbeidsgiver/inntektsmelding#beregningsregler-for-sykepenger'
          isHidden={!readMoreOpen}
        >
          Les mer om beregning av månedslønn.
        </LenkeEksternt>
      </LesMer>
      {feilHentingAvInntektsdata && feilHentingAvInntektsdata.length > 0 && (
        <Alert variant='info'>
          Vi har problemer med å hente inntektsopplysninger akkurat nå. Du kan legge inn beregnet månedsinntekt selv
          eller forsøke igjen senere.
        </Alert>
      )}

      {harTidligereInntekt && (
        <>
          <BodyLong>Følgende lønnsopplysninger er hentet fra A-meldingen:</BodyLong>
          <TidligereInntekt tidligereinntekt={sisteTreMndTidligereinntekt} henterData={henterData} />
        </>
      )}
      {!harTidligereInntekt && (
        <BodyLong>
          Angi bruttoinntekt som snitt av gjennomsnitt tre måneders lønn. Dersom inntekten har gått opp pga. varig -
          lønnsforhøyelse, og ikke for eksempel representerer uforutsett overtid kan dette gjøre at inntekten settes
          høyere enn gjennomsnitt av siste tre måneder.
        </BodyLong>
      )}
      {harTidligereInntekt && manglendeEller0FraAmeldingen && (
        <Alert variant='warning' className={lokalStyles.feriealert}>
          Lønnsopplysningene innholder måneder uten rapportert inntekt. Vi estimerer beregnet månedslønn til et snitt av
          innrapportert inntekt for de tre siste månedene. Hvis dere ser at det skal være en annen beregnet månedslønn
          må dere endre dette manuelt.
        </Alert>
      )}
      {erFeriemaaneder && (
        <Alert variant='warning' className={lokalStyles.feriealert}>
          Lønnsopplysningene kan innholde måneder der det er utbetalt feriepenger. Hvis det i beregningsperioden er
          utbetalt feriepenger i stedet for lønn, eller det er avviklet ferie uten lønn, skal beregningsgrunnlaget
          settes lik den ordinære lønnen personen ville hatt hvis det ikke hadde blitt avviklet ferie.
        </Alert>
      )}
      {!endringAvBelop && !erBlanktSkjema && (
        <TextLabel className={lokalStyles.tbmargin}>
          Med utgangspunkt i {formatDate(bestemmendeFravaersdag)} gir disse lønnsopplysningene en estimert beregnet
          månedslønn på
        </TextLabel>
      )}
      <div className={lokalStyles.beloepwrapper}>
        {!endringAvBelop && !erBlanktSkjema && (
          <>
            <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-beloep'>
              {formatCurrency(gjennomsnittligInntekt ? gjennomsnittligInntekt : 0)} kr/måned
            </TextLabel>
            <ButtonEndre data-cy='endre-beloep' onClick={setEndreMaanedsinntektHandler} />
          </>
        )}
        {(endringAvBelop || erBlanktSkjema) && (
          <Aarsaksvelger
            bruttoinntekt={bruttoinntekt}
            changeMaanedsintektHandler={addIsDirtyForm(changeMaanedsintektHandler)}
            changeBegrunnelseHandler={addIsDirtyForm(changeBegrunnelseHandler)}
            defaultEndringAarsak={endringAarsak}
            setEndringAarsakGjelderFra={addIsDirtyForm(setEndringAarsakGjelderFra)}
            setEndringAarsakBleKjent={addIsDirtyForm(setEndringAarsakBleKjent)}
            setPerioder={addIsDirtyForm(setPerioder)}
            visFeilmeldingsTekst={visFeilmeldingsTekst}
            bestemmendeFravaersdag={bestemmendeFravaersdag}
            nyInnsending={nyInnsending}
            clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
            kanIkkeTilbakestilles={erBlanktSkjema}
          />
        )}
      </div>
      <BodyShort className={lokalStyles.bruttoinntektBelopBeskrivelse}>Stemmer dette?</BodyShort>
      <BodyLong>
        Sjekk nøye at beregnet månedslønn er korrekt. Hvis den ansatte nylig har fått lønnsøkning, endring i arbeidstid,
        hatt ubetalt fri eller har andre endringer i lønn må dette korrigeres. Overtid skal ikke inkluderes i beregnet
        månedslønn. Beregningen er gjort etter{' '}
        <LenkeEksternt href='https://lovdata.no/nav/folketrygdloven/kap8/%C2%A78-28'>
          folketrygdloven $8-28
        </LenkeEksternt>
        .
      </BodyLong>
    </>
  );
}

function sjekkOmFerieMaaneder(tidligereinntekt: Array<HistoriskInntekt> | undefined): boolean {
  const ferieMnd = tidligereinntekt
    ?.map((inntekt) => inntekt.maaned.split('-')[1])
    .filter((mnd) => Number(mnd) >= 5 && Number(mnd) <= 8);

  return ferieMnd !== undefined && ferieMnd.length > 0;
}
