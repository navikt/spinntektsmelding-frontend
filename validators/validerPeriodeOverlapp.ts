import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum PeriodeOverlappFeilkode {
  PERIODE_OVERLAPPER = 'PERIODE_OVERLAPPER'
}

export default function validerPeriodeOverlapp(perioder: Array<Periode>): Array<ValiderResultat> {
  const feilkoder: Array<ValiderResultat> = [];

  for (let i = 0; i < perioder.length; i++) {
    for (let j = i + 1; j < perioder.length; j++) {
      const a = perioder[i];
      const b = perioder[j];
      if (!a?.fom || !a?.tom || !b?.fom || !b?.tom) continue; // skip incomplete
      if (a.fom <= b.tom && a.tom >= b.fom) {
        feilkoder.push({
          felt: 'arbeidsgiverperioder-feil',
          code: PeriodeOverlappFeilkode.PERIODE_OVERLAPPER
        });

        return feilkoder;
      }
    }
  }

  return feilkoder;
}
