import { Periode } from '../../state/state';
import formatDate from '../../utils/formatDate';
import parseIsoDate from '../../utils/parseIsoDate';
import { EndringAarsakSchema } from '../../validators/validerAapenInnsending';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import PeriodeFraTil from '../PeriodeFraTil/PeriodeFraTil';
import lokalStyle from './EndringAarsakVisning.module.css';
import { z } from 'zod';

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

type EndringAarsakVisningType = z.infer<typeof EndringAarsakSchema>;

export default function EndringAarsakVisning(props: EndringAarsakVisningType) {
  const formatIsoDate = (isoDate: string) => formatDate(parseIsoDate(isoDate));

  switch (props.aarsak) {
    case begrunnelseEndringBruttoinntekt.Tariffendring: {
      return (
        <>
          <div>Tariffendring gjelder fra: {formatIsoDate(props.gjelderFra)}</div>
          <div>Dato tariffendring ble kjent: {formatIsoDate(props.bleKjent)}</div>
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
          <div>{formatIsoDate(props.gjelderFra)}</div>
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
          <div>{formatIsoDate(props.gjelderFra)}</div>
        </>
      );
    }
    case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
      return (
        <>
          <div className={lokalStyle.uthevet}>Ny stillingsprosent fra</div>
          <div>{formatIsoDate(props.gjelderFra)}</div>
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
