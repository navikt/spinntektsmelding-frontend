import { BodyShort } from '@navikt/ds-react';
import { LonnISykefravaeret } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import lokalStyle from './LonnUnderSykefravaeret.module.css';

interface LonnUnderSykefravaeretProps {
  lonn: LonnISykefravaeret;
}

export default function LonnUnderSykefravaeret({ lonn }: LonnUnderSykefravaeretProps) {
  if (lonn.status === 'Nei') return <div className={lokalStyle.wrapper}>Nei</div>;

  return (
    <div className={lokalStyle.wrapper}>
      <BodyShort>Ja</BodyShort>
      {lonn.belop && <BodyShort>{formatCurrency(lonn.belop)} kr</BodyShort>}
    </div>
  );
}
