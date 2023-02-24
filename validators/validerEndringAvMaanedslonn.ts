import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

export enum EndringAvMaanedslonnFeilkode {
  MANGLER_BELOP = 'MANGLER_BELOP',
  MANGLER_DATO = 'MANGLER_DATO',
  MANGLER_BELOP_OG_DATO = 'MANGLER_BELOP_OG_DATO',
  MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN = 'MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN'
}

export default function valdiderEndringAvMaanedslonn(
  harRefusjonEndringer?: boolean,
  refusjonEndringer?: Array<EndringsBelop>
): Array<ValiderResultat> {
  let feilmeldinger: Array<ValiderResultat> = [];

  // if (!harRefusjonEndringer) {
  //   feilmeldinger.push({
  //     felt: 'lus-utbetaling-endring-radio',
  //     code: EndringAvMaanedslonnFeilkode.MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN
  //   });
  //   return feilmeldinger;
  // }

  if (refusjonEndringer) {
    refusjonEndringer.forEach((endring, index) => {
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
