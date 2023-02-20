import { BodyLong, BodyShort, Button, Checkbox, CheckboxGroup, Link, TextField } from '@navikt/ds-react';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
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
import LonnsendringDato from './LonnsendringDato';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';
import NyStillingDato from './NyStillingDato';
import NyStillingsprosentDato from './NyStillingsprosentDato';
import PeriodeListevelger from './PeriodeListevelger';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';

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
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);
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
  const setPermiteringPeriode = useBoundStore((state) => state.setPermiteringPeriode);
  const permitering = useBoundStore((state) => state.permitering);

  const clickTilbakestillMaanedsinntekt = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setEndreMaanedsinntekt(false);
      tilbakestillMaanedsinntekt();
    },
    [setEndreMaanedsinntekt, tilbakestillMaanedsinntekt]
  );

  const changeMaanedsintektHandler = (event: ChangeEvent<HTMLInputElement>) => setNyMaanedsinntekt(event.target.value);

  const changeBegrunnelseHandler = useCallback((aarsak: string) => setEndringsaarsak(aarsak), [setEndringsaarsak]);

  const changeKorrektInntektHandler = (event: FormEvent<HTMLInputElement>) =>
    bekreftKorrektInntekt(event.currentTarget.checked);

  const setNyMaanedsinntektBlanktSkjemaHandler = (event: ChangeEvent<HTMLInputElement>) =>
    setNyMaanedsinntektBlanktSkjema(event.target.value);

  const setEndreMaanedsinntektHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setEndreMaanedsinntekt(true);
      bekreftKorrektInntekt(false, true);
    },
    [setEndreMaanedsinntekt, bekreftKorrektInntekt]
  );

  const endringAvBelop = endreMaanedsinntekt || bruttoinntekt.endringsaarsak;
  const bekreftetBruttoinntekt = bruttoinntekt?.bekreftet ? ['Ja'] : [];

  if (tidligereinntekt && tidligereinntekt.length > 0) {
    return (
      <>
        <Heading3>Beregnet månedslønn</Heading3>
        <BodyLong>Følgende lønnsopplysninger er hentet fra A-meldingen:</BodyLong>
        <TidligereInntekt tidligereinntekt={tidligereinntekt} />
        {!endringAvBelop && (
          <TextLabel className={lokalStyles.tbmargin}>
            Vi har derfor beregnet månedslønnen {formatDate(bestemmendeFravaersdag)} til
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
                  id='bruttoinntekt-endringsbelop'
                  error={visFeilmeldingsTekst('bruttoinntekt-endringsbelop')}
                  className={lokalStyles.bruttoinntektendringsbelop}
                />
                <div>
                  <SelectEndringBruttoinntekt
                    onChangeBegrunnelse={changeBegrunnelseHandler}
                    error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
                    id='bruttoinntekt-endringsaarsak'
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
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.VarigLonnsendring && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <LonnsendringDato
                    onChangeLonnsendringsdato={setLonnsendringDato}
                    defaultDate={lonnsendringsdato}
                    toDate={bestemmendeFravaersdag}
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
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.Permitering && (
                <div className={lokalStyles.endreperiodeliste}>
                  <PeriodeListevelger
                    onRangeListChange={setPermiteringPeriode}
                    defaultRange={permitering}
                    fomTekst='Fra'
                    tomTekst='Til'
                    fomIdBase='bruttoinntekt-permitering-fom'
                    tomIdBase='bruttoinntekt-permitering-tom'
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <NyStillingDato
                    onChangeNyStillingEndringsdato={setNyStillingDato}
                    defaultDate={nystillingdato}
                    toDate={bestemmendeFravaersdag}
                  />
                </div>
              )}
              {endringsaarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
                <div className={lokalStyles.endremaaanedsinntekt}>
                  <NyStillingsprosentDato
                    onChangeNyStillingsprosentdato={setNyStillingsprosentDato}
                    defaultDate={nystillingsprosentdato}
                    toDate={bestemmendeFravaersdag}
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
          <Link href='https://lovdata.no/nav/folketrygdloven/kap8/§8-28'>folketrygdloven $8-28</Link>.
        </BodyLong>
        <CheckboxGroup
          size='medium'
          error={visFeilmeldingsTekst('bruttoinntektbekreft')}
          hideLegend
          legend='Bekreft at månedslønn er korrekt'
          defaultValue={bekreftetBruttoinntekt}
        >
          <Checkbox
            onClick={changeKorrektInntektHandler}
            id='bruttoinntektbekreft'
            error={visFeilmelding('bruttoinntektbekreft')}
            value='Ja'
          >
            Jeg bekrefter at jeg har kontrollert inntekten og at beregnet månedslønn er korrekt.
          </Checkbox>
        </CheckboxGroup>
      </>
    );
  } else {
    return (
      <>
        <Heading3>Beregnet månedslønn</Heading3>
        <BodyLong>
          Angi bruttoinntekt som snitt av siste tre måneders lønn. Dersom inntekten har gått opp pga. varig
          lønnsforhøyelse, og ikke for eksempel representerer uforutsett overtid kan dette gjøre at inntekten settes som
          høyere enn snitt av siste tre måneder..
        </BodyLong>
        <div className={lokalStyles.prosentbody}>
          <TextField
            label='Gjennomsnittsinntekt per måned'
            onChange={setNyMaanedsinntektBlanktSkjemaHandler}
            defaultValue={formatCurrency(
              bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0
            )}
            id='bruttoinntekt-endringsbelop'
            error={visFeilmeldingsTekst('bruttoinntekt-endringsbelop')}
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
