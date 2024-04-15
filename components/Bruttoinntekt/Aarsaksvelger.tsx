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
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import parseIsoDate from '../../utils/parseIsoDate';
import { nanoid } from 'nanoid';

interface AarsaksvelgerProps {
  bruttoinntekt?: Inntekt;
  changeMaanedsintektHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  changeBegrunnelseHandler: (verdi: string) => void;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  defaultEndringAarsak: EndringAarsak;
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
  kanIkkeTilbakestilles?: boolean;
}

export default function Aarsaksvelger({
  bruttoinntekt,
  changeMaanedsintektHandler,
  changeBegrunnelseHandler,
  clickTilbakestillMaanedsinntekt,
  defaultEndringAarsak,
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
  nyInnsending,
  kanIkkeTilbakestilles
}: AarsaksvelgerProps) {
  const blankPeriode: Periode[] = [{ fom: undefined, tom: undefined, id: nanoid() }];

  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      <div className={lokalStyles.endremaaanedsinntekt}>
        <TextField
          label={`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`}
          onChange={changeMaanedsintektHandler}
          defaultValue={bruttoinntekt && bruttoinntekt.bruttoInntekt ? formatCurrency(bruttoinntekt.bruttoInntekt) : ''}
          id='inntekt.beregnetInntekt'
          error={visFeilmeldingsTekst('inntekt.beregnetInntekt')}
          className={lokalStyles.bruttoinntektendringsbeloep}
          data-cy='inntekt-beloep-input'
        />
        <div>
          <SelectEndringBruttoinntekt
            onChangeBegrunnelse={changeBegrunnelseHandler}
            error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
            id='bruttoinntekt-endringsaarsak'
            nyInnsending={nyInnsending}
            value={defaultEndringAarsak?.aarsak as string}
          />
        </div>
        {!kanIkkeTilbakestilles && (
          <div>
            <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={clickTilbakestillMaanedsinntekt} />
          </div>
        )}
      </div>
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <TariffendringDato
            changeTariffEndretDato={setTariffEndringsdato}
            changeTariffKjentDato={setTariffKjentdato}
            defaultEndringsdato={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            defaultKjentDato={parseIsoDate(defaultEndringAarsak?.bleKjent)}
            visFeilmeldingsTekst={visFeilmeldingsTekst}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Ferie && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setFeriePeriode}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Ferie && defaultEndringAarsak?.perioder
                ? periodeMapper(defaultEndringAarsak.perioder)
                : blankPeriode
            }
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
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.VarigLoennsendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <Datovelger
            onDateChange={setLonnsendringDato}
            label='Lønnsendring gjelder fra'
            id='bruttoinntekt-lonnsendring-fom'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            error={visFeilmeldingsTekst('bruttoinntekt-lonnsendring-fom')}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setPermisjonPeriode}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permisjon &&
              defaultEndringAarsak?.perioder
                ? periodeMapper(defaultEndringAarsak.perioder)
                : blankPeriode
            }
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
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permittering && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setPermitteringPeriode}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permittering &&
              periodeMapper(defaultEndringAarsak?.perioder)
                ? defaultEndringAarsak.perioder
                : blankPeriode
            }
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
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <Datovelger
            onDateChange={setNyStillingDato}
            label='Ny stilling fra'
            id='bruttoinntekt-nystilling-fom'
            defaultSelected={defaultEndringAarsak?.gjelderFra}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <Datovelger
            onDateChange={setNyStillingsprosentDato}
            label='Ny stillingsprosent fra'
            id='bruttoinntekt-nystillingsprosent-fom'
            defaultSelected={defaultEndringAarsak?.gjelderFra}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Sykefravaer && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setSykefravaerPeriode}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Sykefravaer &&
              defaultEndringAarsak?.perioder
                ? periodeMapper(defaultEndringAarsak.perioder)
                : blankPeriode
            }
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

export function periodeMapper(perioder: { fom: string; tom: string }[]): Periode[] {
  if (!perioder) return [];
  return perioder.map((periode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: periode.fom + '-' + periode.tom
  }));
}
