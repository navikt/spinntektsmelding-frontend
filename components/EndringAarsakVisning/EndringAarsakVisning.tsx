import { Periode } from '../../state/state';
import formatDate from '../../utils/formatDate';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import PeriodeFraTil from '../PeriodeFraTil/PeriodeFraTil';
import lokalStyle from './EndringAarsakVisning.module.css';

interface EndringAarsakVisningProps {
  endringsaarsak: keyof typeof begrunnelseEndringBruttoinntekt;
  tariffendringDato?: Date;
  tariffkjentdato?: Date;
  ferie?: Array<Periode>;
  lonnsendringsdato?: Date;
  permisjon?: Array<Periode>;
  permittering?: Array<Periode>;
  nystillingdato?: Date;
  nystillingsprosentdato?: Date;
  sykefravaer?: Array<Periode>;
}

export default function EndringAarsakVisning(props: EndringAarsakVisningProps) {
  switch (String(props.endringsaarsak)) {
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
          {props.ferie.map((periode, index) => (
            <PeriodeFraTil
              fom={periode.fom!}
              tom={periode.tom!}
              key={`ferieperiode-${periode.id ? periode.id : index}`}
            />
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
          {props.permisjon.map((periode, index) => (
            <PeriodeFraTil
              fom={periode.fom!}
              tom={periode.tom!}
              key={`permisjonperiode-${periode.id ? periode.id : index}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Permittering: {
      return props.permittering ? (
        <div>
          {props.permittering.map((periode, index) => (
            <PeriodeFraTil
              fom={periode.fom!}
              tom={periode.tom!}
              key={`permitteringperiode-${periode.id ? periode.id : index}`}
            />
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
    case begrunnelseEndringBruttoinntekt.Sykefravaer: {
      return props.sykefravaer ? (
        <div>
          {props.sykefravaer.map((periode, index) => (
            <PeriodeFraTil
              fom={periode.fom!}
              tom={periode.tom!}
              key={`sykefravaer-periode-${periode.id ? periode.id : index}`}
            />
          ))}{' '}
        </div>
      ) : null;
    }
    case begrunnelseEndringBruttoinntekt.Feilregistrert:
    case begrunnelseEndringBruttoinntekt.Bonus:
    case begrunnelseEndringBruttoinntekt.Nyansatt:
    default: {
      return null;
    }
  }
}
