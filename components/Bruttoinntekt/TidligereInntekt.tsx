import { useEffect, useState } from 'react';
import { HistoriskInntekt } from '../../schema/historiskInntektSchema';
import formatCurrency from '../../utils/formatCurrency';
import formatMaanedsnavn from '../../utils/formatMaanedsnavn';
import lokalStyles from './Bruttoinntekt.module.css';
import { Skeleton } from '@navikt/ds-react';
import ugyldigEllerNegativtTall from '../../utils/ugyldigEllerNegativtTall';

interface TidligereInntektProps {
  tidligereinntekt: Array<HistoriskInntekt>;
  henterData: boolean;
}

const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maaned === b.maaned) {
    return 0;
  }

  if (a.maaned < b.maaned) {
    return -1;
  } else {
    return 1;
  }
};

const lasterDataPlaceholder = [
  {
    maaned: 'Dummy1',
    inntekt: 0
  },
  {
    maaned: 'Dummy2',
    inntekt: 0
  },
  {
    maaned: 'Dummy3',
    inntekt: 0
  }
];

export default function TidligereInntekt({ tidligereinntekt, henterData }: Readonly<TidligereInntektProps>) {
  const [sortertInntekt, setSortertInntekt] = useState<Array<HistoriskInntekt>>([]);
  useEffect(() => {
    const inntekter: Array<HistoriskInntekt> = [...tidligereinntekt].sort(sorterInntekter);

    if (inntekter) {
      setSortertInntekt(inntekter);
    }
  }, [tidligereinntekt]);
  return (
    <table
      className={lokalStyles.inntektsliste}
      data-cy='tidligereinntekt'
      summary='Oversikt over inntekter oppgitt i A-meldingen, for de siste tre måneder.'
    >
      <thead>
        <tr>
          <th>Måned</th>
          <th>Inntekt</th>
        </tr>
      </thead>
      <tbody>
        {henterData && (
          <>
            {lasterDataPlaceholder.map((inntekt) => (
              <tr key={inntekt.maaned}>
                <td className={lokalStyles.maanedsnavn}>
                  <Skeleton />:
                </td>
                <td className={lokalStyles.maanedsinntekt}>
                  <Skeleton />
                </td>
              </tr>
            ))}
          </>
        )}
        {!henterData && sortertInntekt.length !== 0 && (
          <>
            {sortertInntekt.map((inntekt) => (
              <tr key={inntekt.maaned}>
                <td className={lokalStyles.maanedsnavn}>{formatMaanedsnavn(inntekt.maaned)}:</td>
                <td className={lokalStyles.maanedsinntekt}>
                  {ugyldigEllerNegativtTall(inntekt.inntekt) && '-'}
                  {!ugyldigEllerNegativtTall(inntekt.inntekt) && <>{formatCurrency(inntekt.inntekt)} kr</>}
                </td>
              </tr>
            ))}
          </>
        )}
      </tbody>
    </table>
  );
}
