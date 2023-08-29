import { Alert, BodyLong, BodyShort } from '@navikt/ds-react';
import { ChangeEvent, useCallback, useState } from 'react';
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
import useAmplitude from '../../utils/useAmplitude';
import Skeleton from 'react-loading-skeleton';
import Aarsaksvelger from './Aarsaksvelger';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
}

export default function Bruttoinntekt({ bestemmendeFravaersdag }: BruttoinntektProps) {
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

  const logEvent = useAmplitude();
  const amplitudeComponent = 'BeregnetMånedslønn';

  const clickTilbakestillMaanedsinntekt = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      logEvent('knapp klikket', {
        tittel: 'Tilbakestill beregnet månedsinntekt',
        component: amplitudeComponent
      });

      setEndreMaanedsinntekt(false);
      tilbakestillMaanedsinntekt();
    },
    [setEndreMaanedsinntekt, tilbakestillMaanedsinntekt, logEvent]
  );

  const changeMaanedsintektHandler = (event: ChangeEvent<HTMLInputElement>) => setNyMaanedsinntekt(event.target.value);

  const changeBegrunnelseHandler = useCallback(
    (aarsak: string) => {
      logEvent('filtervalg', {
        tittel: 'Endringsårsak beregnet månedsinntekt',
        component: amplitudeComponent,
        kategori: aarsak,
        filternavn: 'Endringsårsak beregnet månedsinntekt'
      });

      setEndringsaarsak(aarsak);
    },
    [setEndringsaarsak, logEvent]
  );

  const setEndreMaanedsinntektHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      logEvent('knapp klikket', {
        tittel: 'Endre beregnet månedsinntekt',
        component: amplitudeComponent
      });

      setEndreMaanedsinntekt(true);
    },
    [setEndreMaanedsinntekt, logEvent]
  );

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

  if (tidligereinntekt && tidligereinntekt.length > 0) {
    return (
      <>
        <Heading3 unPadded>Beregnet månedslønn</Heading3>
        <LesMer
          header='Informasjon om beregnet månedslønn'
          open={readMoreOpen}
          onClick={clickLesMerBeregnetMaanedslonn}
        >
          Beregnet månedslønn skal som hovedregel fastsettes ut fra et gjennomsnitt av den inntekten som er rapportert
          til a-ordningen i de 3 siste kalendermånedene før sykefraværet startet.{' '}
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

        <BodyLong>Følgende lønnsopplysninger er hentet fra A-meldingen:</BodyLong>

        {!henterData && <TidligereInntekt tidligereinntekt={tidligereinntekt} />}
        {erFeriemaaneder && (
          <Alert variant='warning' className={lokalStyles.feriealert}>
            Lønnsopplysningene kan innholde måneder der det er utbetalt feriepenger. Hvis det i beregningsperioden er
            utbetalt feriepenger i stedet for lønn, eller det er avviklet ferie uten lønn, skal beregningsgrunnlaget
            settes lik den ordinære lønnen personen ville hatt hvis det ikke hadde blitt avviklet ferie.
          </Alert>
        )}
        {henterData && <Skeleton count={3} />}
        {!endringAvBelop && (
          <TextLabel className={lokalStyles.tbmargin}>
            Med utgangspunkt i {formatDate(bestemmendeFravaersdag)} gir disse lønnsopplysningene en estimert beregnet
            månedslønn på
          </TextLabel>
        )}
        <div className={lokalStyles.belopwrapper}>
          {!endringAvBelop && (
            <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-belop'>
              {formatCurrency(bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0)} kr/måned
            </TextLabel>
          )}
          {endringAvBelop && (
            <Aarsaksvelger
              bruttoinntekt={bruttoinntekt}
              changeMaanedsintektHandler={changeMaanedsintektHandler}
              changeBegrunnelseHandler={changeBegrunnelseHandler}
              tariffendringsdato={tariffendringsdato}
              tariffkjentdato={tariffkjentdato}
              ferie={ferie}
              permisjon={permisjon}
              permittering={permittering}
              nystillingdato={nystillingdato}
              nystillingsprosentdato={nystillingsprosentdato}
              lonnsendringsdato={lonnsendringsdato}
              sykefravaerperioder={sykefravaerperioder}
              setTariffEndringsdato={setTariffEndringsdato}
              setTariffKjentdato={setTariffKjentdato}
              setFeriePeriode={setFeriePeriode}
              setLonnsendringDato={setLonnsendringDato}
              setNyStillingDato={setNyStillingDato}
              setNyStillingsprosentDato={setNyStillingsprosentDato}
              setPermisjonPeriode={setPermisjonPeriode}
              setPermitteringPeriode={setPermitteringPeriode}
              setSykefravaerPeriode={setSykefravaerPeriode}
              visFeilmeldingsTekst={visFeilmeldingsTekst}
              bestemmendeFravaersdag={bestemmendeFravaersdag}
              nyInnsending={nyInnsending}
              clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
            />
          )}
          {!endringAvBelop && <ButtonEndre data-cy='endre-belop' onClick={setEndreMaanedsinntektHandler} />}
        </div>
        <BodyShort>
          <strong>Stemmer dette?</strong>
        </BodyShort>
        <BodyLong>
          Sjekk nøye at beregnet månedslønn er korrekt. Hvis den ansatte nylig har fått lønnsøkning, endring i
          arbeidstid, hatt ubetalt fri eller har andre endringer i lønn må dette korrigeres. Overtid skal ikke
          inkluderes i beregnet månedslønn. Beregningen er gjort etter{' '}
          <LenkeEksternt href='https://lovdata.no/nav/folketrygdloven/kap8/§8-28'>folketrygdloven $8-28</LenkeEksternt>.
        </BodyLong>
      </>
    );
  } else {
    return (
      <>
        <Heading3>Beregnet månedslønn</Heading3>
        <LesMer
          header='Informasjon om beregnet månedslønn'
          open={readMoreOpen}
          onClick={clickLesMerBeregnetMaanedslonn}
        >
          Beregnet månedslønn skal som hovedregel fastsettes ut fra et gjennomsnitt av den inntekten som er rapportert
          til a-ordningen i de 3 siste kalendermånedene før sykefraværet startet.{' '}
          <LenkeEksternt
            href='https://www.nav.no/arbeidsgiver/inntektsmelding#beregningsregler-for-sykepenger'
            isHidden={!readMoreOpen}
          >
            Les mer om beregning av månedslønn.
          </LenkeEksternt>
        </LesMer>
        <BodyLong>
          Angi bruttoinntekt som snitt av siste tre måneders lønn. Dersom inntekten har gått opp pga. varig -
          lønnsforhøyelse, og ikke for eksempel representerer uforutsett overtid kan dette gjøre at inntekten settes som
          - høyere enn snitt av siste tre måneder.
        </BodyLong>
        <div className={lokalStyles.prosentbody}>
          <Aarsaksvelger
            bruttoinntekt={bruttoinntekt}
            changeMaanedsintektHandler={changeMaanedsintektHandler}
            changeBegrunnelseHandler={changeBegrunnelseHandler}
            tariffendringsdato={tariffendringsdato}
            tariffkjentdato={tariffkjentdato}
            ferie={ferie}
            permisjon={permisjon}
            permittering={permittering}
            nystillingdato={nystillingdato}
            nystillingsprosentdato={nystillingsprosentdato}
            lonnsendringsdato={lonnsendringsdato}
            sykefravaerperioder={sykefravaerperioder}
            setTariffEndringsdato={setTariffEndringsdato}
            setTariffKjentdato={setTariffKjentdato}
            setFeriePeriode={setFeriePeriode}
            setLonnsendringDato={setLonnsendringDato}
            setNyStillingDato={setNyStillingDato}
            setNyStillingsprosentDato={setNyStillingsprosentDato}
            setPermisjonPeriode={setPermisjonPeriode}
            setPermitteringPeriode={setPermitteringPeriode}
            setSykefravaerPeriode={setSykefravaerPeriode}
            visFeilmeldingsTekst={visFeilmeldingsTekst}
            bestemmendeFravaersdag={bestemmendeFravaersdag}
            nyInnsending={nyInnsending}
            clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
          />
        </div>
        <BodyLong className={lokalStyles.bruttoinntektbelopbeskrivelse}>
          Vanligvis skal beløpet baseres på et gjennomsnitt av siste tre måneders lønn. Unntak kan være at den ansatte
          nylig har fått lønnsøkning, redusering i arbeidstid eller har andre endringer i lønn.
        </BodyLong>
      </>
    );
  }
}

function sjekkOmFerieMaaneder(tidligereinntekt: Array<HistoriskInntekt> | undefined): boolean {
  const ferieMnd = tidligereinntekt
    ?.map((inntekt) => inntekt.maaned.split('-')[1])
    .filter((mnd) => mnd === '05' || mnd === '06' || mnd === '07');

  return ferieMnd !== undefined && ferieMnd.length > 0;
}
