import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';
import styling from './Behandlingsdager.module.css';
import Heading3 from '../Heading3';
import { Periode } from '../../state/state';

interface BehandlingsdagerProps {
  behandlingsdager?: string[];
  arbeidsgiverperioder?: Periode[];
}

export function Behandlingsdager({ behandlingsdager, arbeidsgiverperioder }: Readonly<BehandlingsdagerProps>) {
  if (!behandlingsdager || behandlingsdager.length === 0) {
    return null;
  }

  const arbeidsgiverDatoer = arbeidsgiverperioder?.flatMap((periode) => periode.fom);

  const sorterteDager = [...behandlingsdager].sort((a, b) => a.localeCompare(b));

  return (
    <div className={styling.behandlingsdager}>
      <Heading3>Behandlingsdager med arbeidsgiverperiode</Heading3>
      <div className={styling.behandlingsdagerListe}>
        {sorterteDager.map((dag) => (
          <p key={dag}>
            {formatDate(parseIsoDate(dag))}{' '}
            {erIArbeidsgiverperioden(dag, arbeidsgiverDatoer) && <span>(Arbeidsgiverperiode)</span>}
          </p>
        ))}
      </div>
    </div>
  );
}

function erIArbeidsgiverperioden(dag: string, arbeidsgiverDatoer?: (Date | undefined)[] | undefined): boolean {
  if (!arbeidsgiverDatoer) return false;

  return arbeidsgiverDatoer.some((dato) => {
    return dato?.getTime() === parseIsoDate(dag)?.getTime();
  });
}
