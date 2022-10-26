import { BodyLong, BodyShort } from '@navikt/ds-react';
import { IArbeidsforhold, LonnIArbeidsgiverperioden } from '../../state/state';
import lokalStyle from './FullLonnIArbeidsgiverperioden.module.css';

interface FullLonnIArbeidsgiverperiodenProps {
  lonnIPerioden: { [key: string]: LonnIArbeidsgiverperioden };
  arbeidsforhold: IArbeidsforhold;
}

export default function FullLonnIArbeidsgiverperioden({
  lonnIPerioden,
  arbeidsforhold
}: FullLonnIArbeidsgiverperiodenProps) {
  return (
    <>
      {lonnIPerioden[arbeidsforhold.arbeidsforholdId].status === 'Ja' && <div className={lokalStyle.wrapper}>Ja</div>}
      {lonnIPerioden[arbeidsforhold.arbeidsforholdId].status === 'Nei' && (
        <div className={lokalStyle.wrapper}>
          <BodyShort>Nei</BodyShort>
          <BodyLong>{lonnIPerioden[arbeidsforhold.arbeidsforholdId].begrunnelse}</BodyLong>
        </div>
      )}
    </>
  );
}
