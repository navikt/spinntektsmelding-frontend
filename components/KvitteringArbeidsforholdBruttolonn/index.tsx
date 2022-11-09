import { IArbeidsforhold } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import Heading3 from '../Heading3';
import Heading4 from '../Heading4';
import lokalStyles from './KvitteringArbeidsforholdBruttolonn.module.css';

interface KvitteringArbeidsforholdBruttolonnInterface {
  lonnPrArbeidsforhold?: { [key: string]: number };
  arbeidsforhold: Array<IArbeidsforhold>;
}

export default function KvitteringArbeidsforholdBruttolonn({
  lonnPrArbeidsforhold,
  arbeidsforhold
}: KvitteringArbeidsforholdBruttolonnInterface) {
  return (
    <div className={lokalStyles.wrapper}>
      <Heading3 className={lokalStyles.overskrift}>Bruttolønn fordelt på arbeidsforhold</Heading3>
      {lonnPrArbeidsforhold &&
        arbeidsforhold &&
        arbeidsforhold.length > 1 &&
        arbeidsforhold.map((forhold: IArbeidsforhold) => (
          <>
            <Heading4 className={lokalStyles.arbeidsforhold}>{forhold.arbeidsforhold}</Heading4>
            {formatCurrency(lonnPrArbeidsforhold[forhold.arbeidsforholdId] || 0)} kr/måned
          </>
        ))}
    </div>
  );
}
