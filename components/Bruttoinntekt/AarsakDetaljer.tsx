import { EndringAarsak } from '../../validators/validerAapenInnsending';
import TariffendringDato from './TariffendringDato';
import lokalStyles from './Bruttoinntekt.module.css';
import parseIsoDate from '../../utils/parseIsoDate';
import begrunnelseEndringBruttoinntekt from './begrunnelseEndringBruttoinntekt';

import { useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';
import PeriodeListevelger from '../PeriodeListeVelger/PeriodeListevelger';

interface AarsakDetaljerProps {
  endringAarsak: EndringAarsak;
  bestemmendeFravaersdag?: Date;
  id: string;
}
export default function AarsakDetaljer({ endringAarsak, bestemmendeFravaersdag, id }: Readonly<AarsakDetaljerProps>) {
  const { watch } = useFormContext();

  const defaultEndringAarsak = watch('inntekt.endringAarsaker.' + id);

  return (
    <>
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <TariffendringDato
            defaultEndringsdato={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            defaultKjentDato={parseIsoDate(defaultEndringAarsak?.bleKjent)}
            defaultMonth={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Ferie && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            fomTekst='Ferie fra'
            tomTekst='Ferie til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.ferier`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.VarigLoennsendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Lønnsendring gjelder fra'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.gjelderFra`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            fomTekst='Permisjon fra'
            tomTekst='Permisjon til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.permisjoner`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permittering && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            fomTekst='Permittering fra'
            tomTekst='Permittering til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.permitteringer`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Ny stilling fra'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.gjelderFra`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Ny stillingsprosent fra'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.gjelderFra`}
          />
        </div>
      )}
      {defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Sykefravaer && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            fomTekst='Sykefravær fra'
            tomTekst='Sykefravær til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name={`inntekt.endringAarsaker.${id}.sykefravaer`}
          />
        </div>
      )}
    </>
  );
}
