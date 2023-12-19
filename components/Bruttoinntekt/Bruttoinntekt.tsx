import { Alert, BodyLong, BodyShort } from '@navikt/ds-react';
import { ChangeEvent, useState } from 'react';
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
import { SkjemaStatus } from '../../state/useSkjemadataStore';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
  setIsDirtyForm: (dirty: boolean) => void;
}

export default function Bruttoinntekt({ bestemmendeFravaersdag, setIsDirtyForm }: BruttoinntektProps) {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);
  const setNyMaanedsinntekt = useBoundStore((state) => state.setNyMaanedsinntekt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const setFeriePeriode = useBoundStore((state) => state.setFeriePeriode);
  const ferie = useBoundStore((state) => state.ferie);
  const setLonnsendringDato = useBoundStore((state) => state.setLonnsendringDato);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const setTariffEndringsdato = useBoundStore((state) => state.setTariffEndringsdato);
  const setTariffKjentdato = useBoundStore((state) => state.setTariffKjentdato);
  const tariffendringsdato = useBoundStore((state) => state.tariffendringsdato);
  const tariffkjentdato = useBoundStore((state) => state.tariffkjentdato);
  const setNyStillingDato = useBoundStore((state) => state.setNyStillingDato);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const setNyStillingsprosentDato = useBoundStore((state) => state.setNyStillingsprosentDato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const setPermisjonPeriode = useBoundStore((state) => state.setPermisjonPeriode);
  const permisjon = useBoundStore((state) => state.permisjon);
  const setPermitteringPeriode = useBoundStore((state) => state.setPermitteringPeriode);
  const setSykefravaerPeriode = useBoundStore((state) => state.setSykefravaerPeriode);
  const permittering = useBoundStore((state) => state.permittering);
  const sykefravaerperioder = useBoundStore((state) => state.sykefravaerperioder);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const henterData = useBoundStore((state) => state.henterData);
  const feilHentingAvInntektsdata = useBoundStore((state) => state.feilHentingAvInntektsdata);
  const skjemastatus = useBoundStore((state) => state.skjemastatus);

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
    setNyMaanedsinntekt(event.target.value);
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

  const endringAvBelop = endreMaanedsinntekt || bruttoinntekt.endringsaarsak;
  const [readMoreOpen, setReadMoreOpen] = useState<boolean>(false);

  const erFeriemaaneder = sjekkOmFerieMaaneder(tidligereinntekt);

  const harTidligereInntekt = tidligereinntekt && tidligereinntekt.length > 0;

  const manglendeEller0FraAmeldingen =
    !tidligereinntekt || tidligereinntekt?.filter((inntekt) => !inntekt.inntekt).length > 0;

  const erBlanktSkjema = skjemastatus === SkjemaStatus.BLANK;

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
          <TidligereInntekt tidligereinntekt={tidligereinntekt} henterData={henterData} />
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
      <div className={lokalStyles.belopwrapper}>
        {!endringAvBelop && !erBlanktSkjema && (
          <>
            <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-belop'>
              {formatCurrency(bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0)} kr/måned
            </TextLabel>
            <ButtonEndre data-cy='endre-belop' onClick={setEndreMaanedsinntektHandler} />
          </>
        )}
        {(endringAvBelop || erBlanktSkjema) && (
          <Aarsaksvelger
            bruttoinntekt={bruttoinntekt}
            changeMaanedsintektHandler={addIsDirtyForm(changeMaanedsintektHandler)}
            changeBegrunnelseHandler={addIsDirtyForm(changeBegrunnelseHandler)}
            tariffendringsdato={tariffendringsdato}
            tariffkjentdato={tariffkjentdato}
            ferie={ferie}
            permisjon={permisjon}
            permittering={permittering}
            nystillingdato={nystillingdato}
            nystillingsprosentdato={nystillingsprosentdato}
            lonnsendringsdato={lonnsendringsdato}
            sykefravaerperioder={sykefravaerperioder}
            setTariffEndringsdato={addIsDirtyForm(setTariffEndringsdato)}
            setTariffKjentdato={addIsDirtyForm(setTariffKjentdato)}
            setFeriePeriode={addIsDirtyForm(setFeriePeriode)}
            setLonnsendringDato={addIsDirtyForm(setLonnsendringDato)}
            setNyStillingDato={addIsDirtyForm(setNyStillingDato)}
            setNyStillingsprosentDato={addIsDirtyForm(setNyStillingsprosentDato)}
            setPermisjonPeriode={addIsDirtyForm(setPermisjonPeriode)}
            setPermitteringPeriode={addIsDirtyForm(setPermitteringPeriode)}
            setSykefravaerPeriode={addIsDirtyForm(setSykefravaerPeriode)}
            visFeilmeldingsTekst={visFeilmeldingsTekst}
            bestemmendeFravaersdag={bestemmendeFravaersdag}
            nyInnsending={nyInnsending}
            clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
            kanIkkeTilbakestilles={erBlanktSkjema}
          />
        )}
      </div>
      <BodyShort className={lokalStyles.bruttoinntektbelopbeskrivelse}>Stemmer dette?</BodyShort>
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
