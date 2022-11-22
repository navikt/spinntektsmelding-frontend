import { BodyLong, BodyShort } from '@navikt/ds-react';
import { LonnIArbeidsgiverperioden } from '../../state/state';
import lokalStyle from './FullLonnIArbeidsgiverperioden.module.css';

interface FullLonnIArbeidsgiverperiodenProps {
  lonnIPerioden: LonnIArbeidsgiverperioden;
}

export default function FullLonnIArbeidsgiverperioden({ lonnIPerioden }: FullLonnIArbeidsgiverperiodenProps) {
  if (!lonnIPerioden) return null;
  return (
    <>
      {lonnIPerioden.status === 'Ja' && <div className={lokalStyle.wrapper}>Ja</div>}
      {lonnIPerioden.status === 'Nei' && (
        <div className={lokalStyle.wrapper}>
          <BodyShort>Nei</BodyShort>
          <BodyLong>{lonnIPerioden.begrunnelse}</BodyLong>
        </div>
      )}
    </>
  );
}
