import { EndringAarsak } from '../../validators/validerAapenInnsending';
import TariffendringDato from './TariffendringDato';
import lokalStyles from './Bruttoinntekt.module.css';
import parseIsoDate from '../../utils/parseIsoDate';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';

import { Periode } from '../../state/state';
import PeriodeListevelger from './PeriodeListevelger';
import Datovelger from '../Datovelger';
import { periodeMapper, blankPeriode } from '../../utils/periodeMapper';

interface AarsakDetaljerProps {
  endringAarsak: EndringAarsak;
  bestemmendeFravaersdag?: Date;
  setEndringAarsakGjelderFra: (dato?: Date) => void;
  setEndringAarsakBleKjent: (dato?: Date) => void;
  setPerioder: (periode?: Array<Periode>) => void;
  visFeilmeldingTekst: (feilmelding: string) => string;
}
export default function AarsakDetaljer({
  endringAarsak,
  bestemmendeFravaersdag,
  setEndringAarsakGjelderFra,
  setEndringAarsakBleKjent,
  setPerioder,
  visFeilmeldingTekst
}: Readonly<AarsakDetaljerProps>) {
  const defaultEndringAarsak = endringAarsak;

  console.log('defaultEndringAarsak', defaultEndringAarsak);

  return (
    <>
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <TariffendringDato
            changeTariffEndretDato={setEndringAarsakGjelderFra}
            changeTariffKjentDato={setEndringAarsakBleKjent}
            defaultEndringsdato={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            defaultKjentDato={parseIsoDate(defaultEndringAarsak?.bleKjent)}
            visFeilmeldingTekst={visFeilmeldingTekst}
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Ferie && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            onRangeListChange={setPerioder}
            defaultRange={periodeMapper(defaultEndringAarsak.ferier)}
            fomTekst='Ferie fra'
            tomTekst='Ferie til'
            fomIdBase='bruttoinntekt-ful-fom'
            tomIdBase='bruttoinntekt-ful-tom'
            visFeilmeldingTekst={visFeilmeldingTekst}
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
            error={visFeilmeldingTekst('bruttoinntekt-lonnsendring-fom')}
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
            visFeilmeldingTekst={visFeilmeldingTekst}
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
            visFeilmeldingTekst={visFeilmeldingTekst}
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
            visFeilmeldingTekst={visFeilmeldingTekst}
          />
        </div>
      )}
    </>
  );
}
