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
          <th className={lokalStyles.verdi}>Type ytelse</th>
          <th>Bortfallsdato</th>
          <th className={lokalStyles.verdi}>Verdi</th>
        </tr>
      </thead>
      <tbody>
        {ytelser.map((ytelse) => (
          <tr key={ytelse.naturalytelse}>
            <td className={lokalStyles.type}>{naturalytelser[ytelse.naturalytelse!.toUpperCase()]}</td>
            <td>{formatDate(ytelse.sluttdato)}</td>
            <td>{formatCurrency(ytelse.verdiBeloep)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
