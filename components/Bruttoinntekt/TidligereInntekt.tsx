import { HistoriskInntekt } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatMaanedsnavn from '../../utils/formatMaanedsnavn';
import lokalStyles from './Bruttoinntekt.module.css';

interface TidligereInntektProps {
  tidligereinntekt: Array<HistoriskInntekt>;
}

export default function TidligereInntekt({ tidligereinntekt }: TidligereInntektProps) {
  return (
    <table className={lokalStyles.inntektsliste}>
      <tbody>
        {tidligereinntekt?.map((inntekt) => (
          <tr key={inntekt.id}>
            <td className={lokalStyles.maanedsnavn}>{formatMaanedsnavn(inntekt.maanedsnavn)}:</td>
            <td className={lokalStyles.maanedsinntekt}>{formatCurrency(inntekt.inntekt)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
