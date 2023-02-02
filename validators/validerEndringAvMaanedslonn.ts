import { RefusjonEndring } from '../state/useFyllInnsending';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

export enum EndringAvMaanedslonnFeilkode {
  MANGLER_BELOP = 'MANGLER_BELOP',
  MANGLER_DATO = 'MANGLER_DATO',
  MANGLER_BELOP_OG_DATO = 'MANGLER_BELOP_OG_DATO'
}

export default function valdiderEndringAvMaanedslonn(
  harRefusjonEndringer?: boolean,
  refusjonEndringer?: Array<RefusjonEndring>
): Array<ValiderResultat> {
  if (!harRefusjonEndringer) {
    console.log('Ingen endringer');
    return [];
  }

  console.log('Har endringer', refusjonEndringer?.length);

  let feilmeldinger: Array<ValiderResultat> = [];

  if (refusjonEndringer) {
    refusjonEndringer.forEach((endring, index) => {
      if (!endring.belop && !endring.dato) {
        feilmeldinger.push({
          felt: `lus-utbetaling-endring-belop-${index}`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_BELOP_OG_DATO
        });
      }

      if (!endring.belop) {
        feilmeldinger.push({
          felt: `lus-utbetaling-endring-belop-${index}`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_BELOP
        });
      }

      if (!endring.dato) {
        feilmeldinger.push({
          felt: `lus-utbetaling-endring-dato-${index}`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_DATO
        });
      }
    });
  } else {
    feilmeldinger.push({
      felt: `lus-utbetaling-endring-belop-1`,
      code: EndringAvMaanedslonnFeilkode.MANGLER_BELOP_OG_DATO
    });
  }
  return feilmeldinger;
}
