import { Naturalytelse } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum NaturalytelserFeilkoder {
  MANGLER_VALG_BORTFALL_AV_NATURALYTELSER = 'MANGLER_VALG_BORTFALL_AV_NATURALYTELSER',
  MANGLER_BORTFALLSDATO = 'MANGLER_BORTFALLSDATO',
  MANGLER_VERDI = 'MANGLER_VERDI',
  MANGLER_TYPE = 'MANGLER_TYPE'
}

export default function validerNaturalytelser(
  naturalytelser?: Array<Naturalytelse>,
  hasBortfallAvNaturalytelser?: boolean
): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];

  if (hasBortfallAvNaturalytelser === undefined) {
    feilkoder.push({
      felt: '',
      code: NaturalytelserFeilkoder.MANGLER_VALG_BORTFALL_AV_NATURALYTELSER
    });
  }

  if (naturalytelser && naturalytelser.length > 0) {
    naturalytelser.forEach((ytelse) => {
      if (!ytelse.sluttdato) {
        feilkoder.push({
          felt: 'naturalytelse-dato-' + ytelse.naturalytelse,
          code: NaturalytelserFeilkoder.MANGLER_BORTFALLSDATO
        });
      }

      if (!ytelse.verdiBeloep) {
        feilkoder.push({
          felt: 'naturalytelse-beloep-' + ytelse.naturalytelse,
          code: NaturalytelserFeilkoder.MANGLER_VERDI
        });
      }

      if (!ytelse.naturalytelse) {
        feilkoder.push({
          felt: 'naturalytelse-type-' + ytelse.naturalytelse,
          code: NaturalytelserFeilkoder.MANGLER_TYPE
        });
      }
    });
  }

  return feilkoder;
}
