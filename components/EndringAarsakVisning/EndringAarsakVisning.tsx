import formatIsoAsReadableDate from '../../utils/formatIsoAsReadableDate';
import parseIsoDate from '../../utils/parseIsoDate';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import PeriodeFraTil from '../PeriodeFraTil/PeriodeFraTil';
import lokalStyle from './EndringAarsakVisning.module.css';

interface EndringAarsakVisningProps {
  endringAarsak: EndringAarsak;
}

export default function EndringAarsakVisning({ endringAarsak }: EndringAarsakVisningProps) {
  const props = endringAarsak;
  if (!props) {
    return null;
  }
  switch (props.aarsak) {
    case begrunnelseEndringBruttoinntekt.Tariffendring: {
      return (
        <>
          <div>Tariffendring gjelder fra: {formatIsoAsReadableDate(props.gjelderFra)}</div>
          <div>Dato tariffendring ble kjent: {formatIsoAsReadableDate(props.bleKjent)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.Sykefravaer: {
      return props.sykefravaer ? (
        <div>
          {props.sykefravaer.map((periode, index) => (
            <PeriodeFraTil
              fomTekst='Sykefravær fra'
              tomTekst='Sykefravær til'
              fom={enforceDate(periode.fom)}
              tom={enforceDate(periode.tom)}
              key={`${props.aarsak.toLowerCase()}periode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Permittering: {
      return props.permitteringer ? (
        <div>
          {props.permitteringer.map((periode, index) => (
            <PeriodeFraTil
              fomTekst='Permittering fra'
              tomTekst='Permittering til'
              fom={enforceDate(periode.fom)}
              tom={enforceDate(periode.tom)}
              key={`${props.aarsak.toLowerCase()}periode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Permisjon: {
      return props.permisjoner ? (
        <div>
          {props.permisjoner.map((periode, index) => (
            <PeriodeFraTil
              fomTekst='Permisjon fra'
              tomTekst='Permisjon til'
              fom={enforceDate(periode.fom)}
              tom={enforceDate(periode.tom)}
              key={`${props.aarsak.toLowerCase()}periode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Ferie: {
      return props.ferier ? (
        <div>
          {props.ferier.map((periode, index) => (
            <PeriodeFraTil
              fomTekst='Ferie fra'
              tomTekst='Ferie til'
              fom={enforceDate(periode.fom)}
              tom={enforceDate(periode.tom)}
              key={`${props.aarsak.toLowerCase()}periode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.VarigLoennsendring: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Varig lønnsendringsdato</div>
          <div>{formatIsoAsReadableDate(props.gjelderFra)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.NyStilling: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Ny stilling fra</div>
          <div>{formatIsoAsReadableDate(props.gjelderFra)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Ny stillingsprosent fra</div>
          <div>{formatIsoAsReadableDate(props.gjelderFra)}</div>
        </>
      );
    }

    case begrunnelseEndringBruttoinntekt.Feilregistrert:
    case begrunnelseEndringBruttoinntekt.Bonus:
    case begrunnelseEndringBruttoinntekt.Nyansatt:
    case begrunnelseEndringBruttoinntekt.Ferietrekk:
    default: {
      return null;
    }
  }
}

function enforceDate(dato: Date | string): Date {
  if (typeof dato === 'string') {
    return parseIsoDate(dato);
  }
  return dato;
}
