import { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';
import formatDate from '../../utils/formatDate';

interface ArbeidsgiverperiodeProps {
  perioder: Array<FravaersPeriode>;
}

export default function Arbeidsgiverperiode({ perioder }: ArbeidsgiverperiodeProps) {
  const aperioder = perioder.map((periode) => `${formatDate(periode.fom)} til ${formatDate(periode.tom)}`);

  const listedeperioder = aperioder.join(' og ');
  return <>{listedeperioder}</>;
}
