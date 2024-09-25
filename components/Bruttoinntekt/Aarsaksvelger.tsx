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
import formatIsoDate from '../../utils/formatIsoDate';

interface AarsaksvelgerProps {
  bruttoinntekt?: Inntekt;
  changeMaanedsintektHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  changeBegrunnelseHandler: (verdi: string) => void;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  defaultEndringAarsak: EndringAarsak;
  setEndringAarsakGjelderFra: (dato?: Date) => void;
  setEndringAarsakBleKjent: (dato?: Date) => void;
  setPerioder: (periode?: Array<Periode>) => void;
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
  setEndringAarsakGjelderFra,
  setEndringAarsakBleKjent,
  setPerioder,
  visFeilmeldingsTekst,
  bestemmendeFravaersdag,
  nyInnsending,
  kanIkkeTilbakestilles
}: Readonly<AarsaksvelgerProps>) {
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
        <div className={lokalStyles.selectEndringBruttoinntektWrapper}>
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
            changeTariffEndretDato={setEndringAarsakGjelderFra}
            changeTariffKjentDato={setEndringAarsakBleKjent}
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
            onRangeListChange={setPerioder}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Ferie && defaultEndringAarsak?.ferier
                ? periodeMapper(defaultEndringAarsak.ferier)
                : blankPeriode
            }
            fomTekst='Ferie fra'
            tomTekst='Ferie til'
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
            onDateChange={setEndringAarsakGjelderFra}
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
            onRangeListChange={setPerioder}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permisjon &&
              defaultEndringAarsak?.permisjoner
                ? periodeMapper(defaultEndringAarsak.permisjoner)
                : blankPeriode
            }
            fomTekst='Permisjon fra'
            tomTekst='Permisjon til'
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
            onRangeListChange={setPerioder}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permittering &&
              defaultEndringAarsak?.permitteringer
                ? periodeMapper(defaultEndringAarsak.permitteringer)
                : blankPeriode
            }
            fomTekst='Permittering fra'
            tomTekst='Permittering til'
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
            onDateChange={setEndringAarsakGjelderFra}
            label='Ny stilling fra'
            id='bruttoinntekt-nystilling-fom'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <Datovelger
            onDateChange={setEndringAarsakGjelderFra}
            label='Ny stillingsprosent fra'
            id='bruttoinntekt-nystillingsprosent-fom'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Sykefravaer && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setPerioder}
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Sykefravaer &&
              defaultEndringAarsak?.sykefravaer
                ? periodeMapper(defaultEndringAarsak.sykefravaer)
                : blankPeriode
            }
            fomTekst='Sykefravær fra'
            tomTekst='Sykefravær til'
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

export function periodeMapper(perioder: { fom: Date; tom: Date }[] | { fom: string; tom: string }[]): Periode[] {
  if (!perioder) return [];
  return perioder.map((periode) => {
    const fomId = periode.fom ? isoDate(periode.fom) : 'undefined';
    const tomId = periode.tom ? isoDate(periode.tom) : 'undefined';

    return {
      fom: typeof periode.fom === 'string' ? parseIsoDate(periode.fom) : periode.fom,
      tom: typeof periode.tom === 'string' ? parseIsoDate(periode.tom) : periode.tom,
      id: fomId + '-' + tomId
    };
  });
}

function isoDate(date: Date | string): string {
  if (typeof date !== 'string') {
    return formatIsoDate(date);
  }
  return date;
}
