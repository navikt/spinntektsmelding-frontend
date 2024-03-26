import { Naturalytelse, YesNo } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum NaturalytelserFeilkoder {
  MANGLER_VALG_BORTFALL_AV_NATURALYTELSER = 'MANGLER_VALG_BORTFALL_AV_NATURALYTELSER',
  MANGLER_BORTFALLSDATO = 'MANGLER_BORTFALLSDATO',
  MANGLER_VERDI = 'MANGLER_VERDI',
  MANGLER_TYPE = 'MANGLER_TYPE'
}

export default function validerNaturalytelser(
  naturalytelser?: Array<Naturalytelse>,
  hasBortfallAvNaturalytelser?: YesNo
): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];

  if (hasBortfallAvNaturalytelser === 'Nei') {
    feilkoder.push({
      felt: '',
      code: NaturalytelserFeilkoder.MANGLER_VALG_BORTFALL_AV_NATURALYTELSER
    });
  }

  if (naturalytelser && naturalytelser.length > 0) {
    naturalytelser.forEach((ytelse) => {
      if (!ytelse.bortfallsdato) {
        feilkoder.push({
          felt: 'naturalytelse-dato-' + ytelse.id,
          code: NaturalytelserFeilkoder.MANGLER_BORTFALLSDATO
        });
      }

      if (!ytelse.verdi) {
        feilkoder.push({
          felt: 'naturalytelse-beloep-' + ytelse.id,
          code: NaturalytelserFeilkoder.MANGLER_VERDI
        });
      }

      if (!ytelse.type) {
        feilkoder.push({
          felt: 'naturalytelse-type-' + ytelse.id,
          code: NaturalytelserFeilkoder.MANGLER_TYPE
        });
      }
    });
  }

  return feilkoder;
}
