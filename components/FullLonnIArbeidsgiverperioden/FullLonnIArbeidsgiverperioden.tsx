import { BodyLong, BodyShort } from '@navikt/ds-react';
import { LonnIArbeidsgiverperioden } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import begrunnelseIngenEllerRedusertUtbetalingListe from '../RefusjonArbeidsgiver/begrunnelseIngenEllerRedusertUtbetalingListe';
import lokalStyle from './FullLonnIArbeidsgiverperioden.module.css';

interface FullLonnIArbeidsgiverperiodenProps {
  lonnIPerioden: LonnIArbeidsgiverperioden;
}

const formaterBegrunnelse = (begrunnelseskode: string): string => {
  return begrunnelseIngenEllerRedusertUtbetalingListe[begrunnelseskode];
};

export default function FullLonnIArbeidsgiverperioden({ lonnIPerioden }: FullLonnIArbeidsgiverperiodenProps) {
  if (!lonnIPerioden) return null;
  return (
    <>
      {lonnIPerioden.status === 'Ja' && <div className={lokalStyle.wrapper}>Ja</div>}
      {lonnIPerioden.status === 'Nei' && (
        <div className={lokalStyle.wrapper}>
          <BodyShort>Nei</BodyShort>
          <BodyLong>Utbetalt under arbeidsgiverperiode: {formatCurrency(lonnIPerioden.utbetalt)} kr</BodyLong>
          <BodyLong>
            Begrunnelse for ingen eller redusert utbetaling: {formaterBegrunnelse(lonnIPerioden.begrunnelse)}
          </BodyLong>
        </div>
      )}
    </>
  );
}
