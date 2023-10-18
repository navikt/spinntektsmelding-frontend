import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { TextField } from '@navikt/ds-react';
import SelectEndringBruttoinntekt from './SelectEndringBruttoinntekt';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import { Inntekt, Periode } from '../../state/state';
import React from 'react';
import Datovelger from '../Datovelger';
import PeriodeListevelger from './PeriodeListevelger';
import TariffendringDato from './TariffendringDato';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';

interface AarsaksvelgerProps {
  bruttoinntekt?: Inntekt;
  changeMaanedsintektHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  changeBegrunnelseHandler: (verdi: string) => void;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tariffendringsdato?: Date;
  tariffkjentdato?: Date;
  ferie?: Array<Periode>;
  permisjon?: Array<Periode>;
  permittering?: Array<Periode>;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
  lonnsendringsdato?: Date;
  sykefravaerperioder?: Array<Periode>;
  setTariffEndringsdato: (dato?: Date) => void;
  setTariffKjentdato: (dato?: Date) => void;
  setFeriePeriode: (periode?: Array<Periode>) => void;
  setPermisjonPeriode: (periode?: Array<Periode>) => void;
  setPermitteringPeriode: (periode?: Array<Periode>) => void;
  setNyStillingDato: (dato?: Date) => void;
  setNyStillingsprosentDato: (dato?: Date) => void;
  setLonnsendringDato: (dato?: Date) => void;
  setSykefravaerPeriode: (periode?: Array<Periode>) => void;
  visFeilmeldingsTekst: (feilmelding: string) => string;
  bestemmendeFravaersdag?: Date;
  nyInnsending: boolean;
}

export default function Aarsaksvelger({
  bruttoinntekt,
  changeMaanedsintektHandler,
  changeBegrunnelseHandler,
  clickTilbakestillMaanedsinntekt,
  tariffendringsdato,
  tariffkjentdato,
  ferie,
  permisjon,
  permittering,
  nystillingdato,
  nystillingsprosentdato,
  lonnsendringsdato,
  sykefravaerperioder,
  setTariffEndringsdato,
  setTariffKjentdato,
  setFeriePeriode,
  setPermisjonPeriode,
  setPermitteringPeriode,
  setNyStillingDato,
  setNyStillingsprosentDato,
  setLonnsendringDato,
  setSykefravaerPeriode,
  visFeilmeldingsTekst,
  bestemmendeFravaersdag,
  nyInnsending
}: AarsaksvelgerProps) {
  console.log('Bruttoinntekt', bruttoinntekt);
  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      <div className={lokalStyles.endremaaanedsinntekt}>
        <TextField
          label={`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`}
          onChange={changeMaanedsintektHandler}
          defaultValue={bruttoinntekt && bruttoinntekt.bruttoInntekt ? formatCurrency(bruttoinntekt.bruttoInntekt) : ''}
          id='inntekt.beregnetInntekt'
          error={visFeilmeldingsTekst('inntekt.beregnetInntekt')}
          className={lokalStyles.bruttoinntektendringsbelop}
          data-cy='inntekt-belop-input'
        />
        <div>
          <SelectEndringBruttoinntekt
            onChangeBegrunnelse={changeBegrunnelseHandler}
            error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
            id='bruttoinntekt-endringsaarsak'
            nyInnsending={nyInnsending}
            value={bruttoinntekt?.endringsaarsak as string}
          />
        </div>
        <div>
          <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={clickTilbakestillMaanedsinntekt} />
        </div>
      </div>
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
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
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.Ferie && (
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
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.VarigLonnsendring && (
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
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
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
            visFeilmeldingsTekst={visFeilmeldingsTekst}
          />
        </div>
      )}
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.Permittering && (
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
            visFeilmeldingsTekst={visFeilmeldingsTekst}
          />
        </div>
      )}
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
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
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
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
      {bruttoinntekt?.endringsaarsak === begrunnelseEndringBruttoinntekt.Sykefravaer && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setSykefravaerPeriode}
            defaultRange={sykefravaerperioder}
            fomTekst='Fra'
            tomTekst='Til'
            fomIdBase='bruttoinntekt-sykefravaerperioder-fom'
            tomIdBase='bruttoinntekt-sykefravaerperioder-tom'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            visFeilmeldingsTekst={visFeilmeldingsTekst}
          />
        </div>
      )}
    </div>
  );
}
