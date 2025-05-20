import { HistoriskInntekt } from '../../schema/HistoriskInntektSchema';
import formatCurrency from '../../utils/formatCurrency';
import formatMaanedsnavn from '../../utils/formatMaanedsnavn';
import lokalStyles from './Bruttoinntekt.module.css';
import { Skeleton } from '@navikt/ds-react';
import ugyldigEllerNegativtTall from '../../utils/ugyldigEllerNegativtTall';

interface TidligereInntektProps {
  tidligereinntekt: HistoriskInntekt;
  henterData: boolean;
}

const sorterInntekter = (a: [string, number | null], b: [string, number | null]) => {
  if (a[0] === b[0]) {
    return 0;
  }

  if (a[0] < b[0]) {
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
  const inntekter = Array.from(tidligereinntekt).sort(sorterInntekter);

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
        {!henterData && inntekter.length !== 0 && (
          <>
            {inntekter.map((inntekt) => (
              <tr key={inntekt[0]}>
                <td className={lokalStyles.maanedsnavn}>{formatMaanedsnavn(inntekt[0])}:</td>
                <td className={lokalStyles.maanedsinntekt}>
                  {ugyldigEllerNegativtTall(inntekt[1]) && '-'}
                  {!ugyldigEllerNegativtTall(inntekt[1]) && <>{formatCurrency(inntekt[1])} kr</>}
                </td>
              </tr>
            ))}
          </>
        )}
      </tbody>
    </table>
  );
}
