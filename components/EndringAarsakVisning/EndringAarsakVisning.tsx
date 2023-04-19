import { Periode } from '../../state/state';
import formatDate from '../../utils/formatDate';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import PeriodeFraTil from '../PeriodeFraTil/PeriodeFraTil';
import lokalStyle from './EndringAarsakVisning.module.css';

interface EndringAarsakVisningProps {
  endringsaarsak: string;
  tariffendringDato?: Date;
  tariffkjentdato?: Date;
  ferie?: Array<Periode>;
  lonnsendringsdato?: Date;
  permisjon?: Array<Periode>;
  permittering?: Array<Periode>;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
}

export default function EndringAarsakVisning(props: EndringAarsakVisningProps) {
  switch (props.endringsaarsak) {
    case begrunnelseEndringBruttoinntekt.Tariffendring: {
      return (
        <>
          <div>Tariffendring gjelder fra: {formatDate(props.tariffendringDato)}</div>
          <div>Dato tariffendring ble kjent: {formatDate(props.tariffkjentdato)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.Ferie: {
      return props.ferie ? (
        <div>
          {props.ferie.map((periode) => (
            <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'ferieperiode' + periode.id} />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.VarigLonnsendring: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Varig lønnsendringsdato</div>
          <div>{formatDate(props.lonnsendringsdato)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.Permisjon: {
      return props.permisjon ? (
        <div>
          {props.permisjon.map((periode) => (
            <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'permisjonperiode' + periode.id} />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Permittering: {
      return props.permittering ? (
        <div>
          {props.permittering.map((periode) => (
            <PeriodeFraTil fom={periode.fom!} tom={periode.tom!} key={'permitteringperiode' + periode.id} />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.NyStilling: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Ny stilling fra</div>
          <div>{formatDate(props.nystillingdato)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Ny stillingsprosent fra</div>
          <div>{formatDate(props.nystillingsprosentdato)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.Bonus:
    case begrunnelseEndringBruttoinntekt.Nyansatt:
    default: {
      return null;
    }
  }
}
