import { BodyLong, BodyShort, Link, TextField } from '@navikt/ds-react';
import { ChangeEvent, useCallback, useState } from 'react';
import { HistoriskInntekt } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import Heading3 from '../Heading3/Heading3';
import TextLabel from '../TextLabel/TextLabel';
import TidligereInntekt from './TidligereInntekt';
import SelectEndringBruttoinntekt from './SelectEndringBruttoinntekt';
import ButtonEndre from '../ButtonEndre';
import formatDate from '../../utils/formatDate';
import TariffendringDato from './TariffendringDato';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import PeriodeListevelger from './PeriodeListevelger';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import Datovelger from '../Datovelger';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import LesMer from '../LesMer';
import useAmplitude from '../../utils/useAmplitude';
import Skeleton from 'react-loading-skeleton';

interface BruttoinntektProps {
  bestemmendeFravaersdag?: Date;
}

export default function Bruttoinntekt({ bestemmendeFravaersdag }: BruttoinntektProps) {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);
  const bekreftKorrektInntekt = useBoundStore((state) => state.bekreftKorrektInntekt);
  const setNyMaanedsinntekt = useBoundStore((state) => state.setNyMaanedsinntekt);
  const [setEndringsaarsak, endringsaarsak] = useBoundStore((state) => [
    state.setEndringsaarsak,
    state.bruttoinntekt.endringsaarsak
  ]);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const setNyMaanedsinntektBlanktSkjema = useBoundStore((state) => state.setNyMaanedsinntektBlanktSkjema);
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
  const permittering = useBoundStore((state) => state.permittering);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const henterData = useBoundStore((state) => state.henterData);

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

  const setNyMaanedsinntektBlanktSkjemaHandler = (event: ChangeEvent<HTMLInputElement>) =>
    setNyMaanedsinntektBlanktSkjema(event.target.value);

  const setEndreMaanedsinntektHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      logEvent('knapp klikket', {
        tittel: 'Endre beregnet månedsinntekt',
        component: amplitudeComponent
      });

      setEndreMaanedsinntekt(true);
      bekreftKorrektInntekt(false, true);
    },
    [setEndreMaanedsinntekt, bekreftKorrektInntekt, logEvent]
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

        <BodyLong>Følgende lønnsopplysninger er hentet fra A-meldingen:</BodyLong>
        {!henterData && <TidligereInntekt tidligereinntekt={tidligereinntekt} />}
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
            <div className={lokalStyles.endremaaanedsinntektwrapper}>
              <div className={lokalStyles.endremaaanedsinntekt}>
                <TextField
                  label={`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`}
                  onChange={changeMaanedsintektHandler}
                  defaultValue={formatCurrency(
                    bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0
                  )}
                  id='inntekt.beregnetInntekt'
                  error={visFeilmeldingsTekst('inntekt.beregnetInntekt')}
                  className={lokalStyles.bruttoinntektendringsbelop}
                />
                <div>
                  <SelectEndringBruttoinntekt
                    onChangeBegrunnelse={changeBegrunnelseHandler}
                    error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
                    id='bruttoinntekt-endringsaarsak'
                    nyInnsending={nyInnsending}
                    defaultValue={endringsaarsak}
                  />
                </div>
                <div>
                  <ButtonTilbakestill
                    className={lokalStyles.kontrollerknapp}
                    onClick={clickTilbakestillMaanedsinntekt}
                  />
                </div>
              </div>
              {endringsaarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <TariffendringDato
                    changeTariffEndretDato={setTariffEndringsdato}
                    changeTariffKjentDato={setTariffKjentdato}
                    defaultEndringsdato={tariffendringsdato}
                    defaultKjentDato={tariffkjentdato}
                    visFeilmeldingsTekst={visFeilmeldingsTekst}
                    defaultMonth={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.Ferie && (
                <div className={lokalStyles.endreperiodeliste}>
                  <PeriodeListevelger
                    onRangeListChange={setFeriePeriode}
                    defaultRange={ferie}
                    fomTekst='Fra'
                    tomTekst='Til'
                    fomIdBase='bruttoinntekt-ful-fom'
                    tomIdBase='bruttoinntekt-ful-tom'
                    visFeilmeldingsTekst={visFeilmeldingsTekst}
                    defaultMonth={bestemmendeFravaersdag}
                    toDate={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.VarigLonnsendring && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <Datovelger
                    onDateChange={setLonnsendringDato}
                    label='Lønnsendring gjelder fra'
                    id='bruttoinntekt-lonnsendring-fom'
                    defaultSelected={lonnsendringsdato}
                    toDate={bestemmendeFravaersdag}
                    error={visFeilmeldingsTekst('bruttoinntekt-lonnsendring-fom')}
                    defaultMonth={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
                <div className={lokalStyles.endreperiodeliste}>
                  <PeriodeListevelger
                    onRangeListChange={setPermisjonPeriode}
                    defaultRange={permisjon}
                    fomTekst='Fra'
                    tomTekst='Til'
                    fomIdBase='bruttoinntekt-permisjon-fom'
                    tomIdBase='bruttoinntekt-permisjon-tom'
                    defaultMonth={bestemmendeFravaersdag}
                    toDate={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.Permittering && (
                <div className={lokalStyles.endreperiodeliste}>
                  <PeriodeListevelger
                    onRangeListChange={setPermitteringPeriode}
                    defaultRange={permittering}
                    fomTekst='Fra'
                    tomTekst='Til'
                    fomIdBase='bruttoinntekt-permittering-fom'
                    tomIdBase='bruttoinntekt-permittering-tom'
                    defaultMonth={bestemmendeFravaersdag}
                    toDate={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <Datovelger
                    onDateChange={setNyStillingDato}
                    label='Ny stilling fra'
                    id='bruttoinntekt-nystilling-fom'
                    defaultSelected={nystillingdato}
                    toDate={bestemmendeFravaersdag}
                    defaultMonth={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <Datovelger
                    onDateChange={setNyStillingsprosentDato}
                    label='Ny stillingsprosent fra'
                    id='bruttoinntekt-nystillingsprosent-fom'
                    defaultSelected={nystillingsprosentdato}
                    toDate={bestemmendeFravaersdag}
                    defaultMonth={bestemmendeFravaersdag}
                  />
                </div>
              )}
            </div>
          )}
          {!endringAvBelop && <ButtonEndre onClick={setEndreMaanedsinntektHandler} />}
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
          <TextField
            label='Gjennomsnittsinntekt per måned'
            onChange={setNyMaanedsinntektBlanktSkjemaHandler}
            defaultValue={formatCurrency(
              bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0
            )}
            id='inntekt.beregnetInntekt'
            error={visFeilmeldingsTekst('inntekt.beregnetInntekt')}
            className={lokalStyles.bruttoinntektbelop}
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
