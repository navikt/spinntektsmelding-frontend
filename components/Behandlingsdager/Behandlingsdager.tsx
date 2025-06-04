import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';
import styling from './Behandlingsdager.module.css';
import Heading3 from '../Heading3';

interface BehandlingsdagerProps {
  behandlingsdager?: string[];
}

export function Behandlingsdager({ behandlingsdager }: BehandlingsdagerProps) {
  if (!behandlingsdager || behandlingsdager.length === 0) {
    return null;
  }

  const sorterteDager = behandlingsdager.toSorted();

  return (
    <div className={styling.behandlingsdager}>
      <Heading3>Behandlingsdager</Heading3>
      <div className={styling.behandlingsdagerListe}>
        {sorterteDager.map((dag) => (
          <p key={dag}>{formatDate(parseIsoDate(dag))}</p>
        ))}
      </div>
    </div>
  );
}
