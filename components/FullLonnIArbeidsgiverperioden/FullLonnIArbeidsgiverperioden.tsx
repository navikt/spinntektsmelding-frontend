import { BodyShort } from '@navikt/ds-react';
import { LonnIArbeidsgiverperioden } from '../../state/state';
import lokalStyle from './FullLonnIArbeidsgiverperioden.module.css';

interface FullLonnIArbeidsgiverperiodenProps {
  lonnIPerioden: LonnIArbeidsgiverperioden;
}

export default function FullLonnIArbeidsgiverperioden({ lonnIPerioden }: FullLonnIArbeidsgiverperiodenProps) {
  if (lonnIPerioden.status === 'Ja') return <div className={lokalStyle.wrapper}>Ja</div>;

  return (
    <div className={lokalStyle.wrapper}>
      <BodyShort>Nei</BodyShort>
      <BodyShort>{lonnIPerioden.begrunnelse}</BodyShort>
    </div>
  );
}
