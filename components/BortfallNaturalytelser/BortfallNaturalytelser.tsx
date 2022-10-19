import { Naturalytelse } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import naturalytelser from '../Naturalytelser/SelectNaturalytelser/naturalytelser';
import lokalStyles from './BortfallNaturalytelser.module.css';

interface BortfallNaturalytelserProps {
  ytelser: Array<Naturalytelse>;
}

export default function BortfallNaturalytelser({ ytelser }: BortfallNaturalytelserProps) {
  if (!ytelser || ytelser.length === 0) return <>Ingen naturalytelser har falt bort</>;

  return (
    <table className={lokalStyles.naturalytelser}>
      <thead>
        <tr>
          <th>Type ytelse</th>
          <th>Bortfallsdato</th>
          <th>Verdi</th>
        </tr>
      </thead>
      <tbody>
        {ytelser.map((ytelse) => (
          <tr key={ytelse.type}>
            <td>{naturalytelser[ytelse.type!]}</td>
            <td className={lokalStyles.datokolonne}>{formatDate(ytelse.bortfallsdato)}</td>
            <td>{formatCurrency(ytelse.verdi!)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
