import { useEffect, useState } from 'react';
import { HistoriskInntekt } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatMaanedsnavn from '../../utils/formatMaanedsnavn';
import lokalStyles from './Bruttoinntekt.module.css';

interface TidligereInntektProps {
  tidligereinntekt: Array<HistoriskInntekt>;
}

const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maanedsnavn < b.maanedsnavn) {
    return -1;
  } else {
    return 1;
  }
};

export default function TidligereInntekt({ tidligereinntekt }: TidligereInntektProps) {
  const [sortertInntekt, setSortertInntekt] = useState<Array<HistoriskInntekt>>([]);
  useEffect(() => {
    const inntekter: Array<HistoriskInntekt> = [...tidligereinntekt].sort(sorterInntekter);

    if (inntekter) {
      setSortertInntekt(inntekter);
    }
  }, [tidligereinntekt]);
  return (
    <table className={lokalStyles.inntektsliste}>
      <tbody>
        {sortertInntekt.map((inntekt) => (
          <tr key={inntekt.id}>
            <td className={lokalStyles.maanedsnavn}>{formatMaanedsnavn(inntekt.maanedsnavn)}:</td>
            <td className={lokalStyles.maanedsinntekt}>{formatCurrency(inntekt.inntekt)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
