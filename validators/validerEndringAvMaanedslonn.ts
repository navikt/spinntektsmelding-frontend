import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import { LonnISykefravaeret, YesNo } from '../state/state';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

export enum EndringAvMaanedslonnFeilkode {
  MANGLER_BELOP = 'MANGLER_BELOP',
  MANGLER_DATO = 'MANGLER_DATO',
  MANGLER_BELOP_OG_DATO = 'MANGLER_BELOP_OG_DATO',
  MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN = 'MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN'
}

export default function valdiderEndringAvMaanedslonn(
  harRefusjonEndringer?: YesNo,
  refusjonEndringer?: Array<EndringsBelop>,
  lonnISykefravaeret?: LonnISykefravaeret
): Array<ValiderResultat> {
  let feilmeldinger: Array<ValiderResultat> = [];
  const harLonnISykefravaeret = !!lonnISykefravaeret && lonnISykefravaeret.status === 'Ja';
  if (harLonnISykefravaeret && harRefusjonEndringer === undefined) {
    feilmeldinger.push({
      felt: 'lus-utbetaling-endring-radio',
      code: EndringAvMaanedslonnFeilkode.MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN
    });
    return feilmeldinger;
  }

  if (harRefusjonEndringer === 'Ja' && refusjonEndringer) {
    refusjonEndringer.forEach((endring, index) => {
      if (ugyldigEllerNegativtTall(endring.belop)) {
        feilmeldinger.push({
          felt: `refusjon.refusjonEndringer[${index}].beløp`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_BELOP
        });
      }

      console.log('endring.belop', endring.belop, ugyldigEllerNegativtTall(endring.belop));

      if (!endring.dato) {
        feilmeldinger.push({
          felt: `refusjon.refusjonEndringer[${index}].dato`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_DATO
        });
      }
    });
  }
  return feilmeldinger;
}
