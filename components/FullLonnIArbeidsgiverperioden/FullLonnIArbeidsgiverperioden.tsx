import { BodyShort } from '@navikt/ds-react';
import { LonnIArbeidsgiverperioden } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import begrunnelseIngenEllerRedusertUtbetalingListe from '../RefusjonArbeidsgiver/begrunnelseIngenEllerRedusertUtbetalingListe';
import lokalStyle from './FullLonnIArbeidsgiverperioden.module.css';

interface FullLonnIArbeidsgiverperiodenProps {
  lonnIPerioden?: LonnIArbeidsgiverperioden;
}

const formaterBegrunnelse = (begrunnelseskode: string | undefined): string => {
  return begrunnelseskode ? begrunnelseIngenEllerRedusertUtbetalingListe[begrunnelseskode] : '';
};

export default function FullLonnIArbeidsgiverperioden({ lonnIPerioden }: FullLonnIArbeidsgiverperiodenProps) {
  if (!lonnIPerioden) return null;
  return (
    <>
      {lonnIPerioden.status === 'Ja' && <div>Ja</div>}
      {lonnIPerioden.status === 'Nei' && (
        <div className={lokalStyle.wrapper}>
          <BodyShort>Nei</BodyShort>
          <div className={lokalStyle.uthevet}>Utbetalt under arbeidsgiverperiode</div>
          <div>{lonnIPerioden.utbetalt ? formatCurrency(lonnIPerioden.utbetalt) : 0} kr</div>
          <div className={lokalStyle.uthevet}>Begrunnelse for ingen eller redusert utbetaling</div>
          <div>{formaterBegrunnelse(lonnIPerioden.begrunnelse)}</div>
        </div>
      )}
    </>
  );
}
