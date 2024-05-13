import { Periode } from '../state/state';
import { finnPeriodeMedAntallDager, finnSammenhengendePeriode } from './finnArbeidsgiverperiode';

const finnAktiveFravaersperioder = (perioder?: Periode[]) => {
  if (!perioder) return [];
  const sammenhengenePerioder = finnSammenhengendePeriode(perioder);
  const avgrensetPeriode = finnPeriodeMedAntallDager(sammenhengenePerioder, 17);
  return avgrensetPeriode;
};

export default finnAktiveFravaersperioder;
