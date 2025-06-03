import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';

interface BehandlingsdagerProps {
  behandlingsdager?: string[];
}

export function Behandlingsdager({ behandlingsdager }: BehandlingsdagerProps) {
  if (!behandlingsdager || behandlingsdager.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>Behandlingsdager</h3>
      {behandlingsdager.map((dag) => (
        <div key={dag}>
          <p>{formatDate(parseIsoDate(dag))}</p>
        </div>
      ))}
    </div>
  );
}
