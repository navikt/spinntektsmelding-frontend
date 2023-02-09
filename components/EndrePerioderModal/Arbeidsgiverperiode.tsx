import localStyles from './EndrePerioderModal.module.css';
import { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';
import { ValideringsfeilArbeidsgiverperiode } from './EndrePerioderModal';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';

interface ArbeidsgiverperiodeProps {
  arbeidsgiverperiode: FravaersPeriode;
  rangeChangeHandler: (dato: PeriodeParam | undefined, periodeIndex: number) => void;
  periodeIndex: number;
  onDelete: (periodeIndex: number) => void;
  hasError: Array<ValideringsfeilArbeidsgiverperiode> | undefined;
}

export default function Arbeidsgiverperiode({
  arbeidsgiverperiode,
  rangeChangeHandler,
  periodeIndex,
  onDelete,
  hasError
}: ArbeidsgiverperiodeProps) {
  return (
    <Periodevelger
      onRangeChange={(periode) => rangeChangeHandler(periode, periodeIndex)}
      defaultRange={{
        fom: arbeidsgiverperiode?.fom,
        tom: arbeidsgiverperiode?.tom
      }}
      fomTekst='Arbeidsgiverperiode fra'
      fomID={`epm-fom-${periodeIndex}`}
      tomTekst='Arbeidsgiverperiode til'
      tomID={`epm-tom-${periodeIndex}`}
      kanSlettes={periodeIndex !== 0}
      periodeId={periodeIndex + ''}
      onSlettRad={() => onDelete(periodeIndex)}
    />
  );
}
