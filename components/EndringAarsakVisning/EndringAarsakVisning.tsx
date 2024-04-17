import formatIsoAsReadableDate from '../../utils/formatIsoAsReadableDate';
import parseIsoDate from '../../utils/parseIsoDate';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import PeriodeFraTil from '../PeriodeFraTil/PeriodeFraTil';
import lokalStyle from './EndringAarsakVisning.module.css';

export default function EndringAarsakVisning(props: EndringAarsak) {
  switch (props.aarsak) {
    case begrunnelseEndringBruttoinntekt.Tariffendring: {
      return (
        <>
          <div>Tariffendring gjelder fra: {formatIsoAsReadableDate(props.gjelderFra)}</div>
          <div>Dato tariffendring ble kjent: {formatIsoAsReadableDate(props.bleKjent)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.Ferie: {
      return props.perioder ? (
        <div>
          {props.perioder.map((periode, index) => (
            <PeriodeFraTil
              fom={parseIsoDate(periode.fom)}
              tom={parseIsoDate(periode.tom)}
              key={`ferieperiode-${periode.fom}-${periode.tom}`}
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
    case begrunnelseEndringBruttoinntekt.Permisjon: {
      return props.perioder ? (
        <div>
          {props.perioder.map((periode, index) => (
            <PeriodeFraTil
              fom={parseIsoDate(periode.fom)}
              tom={parseIsoDate(periode.tom)}
              key={`permisjonperiode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Permittering: {
      return props.perioder ? (
        <div>
          {props.perioder.map((periode, index) => (
            <PeriodeFraTil
              fom={parseIsoDate(periode.fom)}
              tom={parseIsoDate(periode.tom)}
              key={`permitteringperiode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
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
    case begrunnelseEndringBruttoinntekt.Sykefravaer: {
      return props.perioder ? (
        <div>
          {props.perioder.map((periode, index) => (
            <PeriodeFraTil
              fom={parseIsoDate(periode.fom)}
              tom={parseIsoDate(periode.tom)}
              key={`sykefravaer-periode-${periode.fom}-${periode.tom}`}
            />
          ))}{' '}
        </div>
      ) : null;
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
