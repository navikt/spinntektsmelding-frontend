import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';
import styling from './Behandlingsdager.module.css';

interface BehandlingsdagerProps {
  behandlingsdager?: string[];
}

export function Behandlingsdager({ behandlingsdager }: BehandlingsdagerProps) {
  if (!behandlingsdager || behandlingsdager.length === 0) {
    return null;
  }

  return (
    <div className={styling.behandlingsdager}>
      <h3>Behandlingsdager</h3>
      <div className={styling.behandlingsdagerListe}>
        {behandlingsdager.map((dag) => (
          <p key={dag}>{formatDate(parseIsoDate(dag))}</p>
        ))}
      </div>
    </div>
  );
}
