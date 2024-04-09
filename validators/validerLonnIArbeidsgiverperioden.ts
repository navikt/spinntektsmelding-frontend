import { LonnIArbeidsgiverperioden, Periode } from '../state/state';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum LonnIArbeidsgiverperiodenFeilkode {
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER = 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE = 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
  LONN_I_ARBEIDSGIVERPERIODEN_BELOP = 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
  LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE = 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE'
}

export default function validerLonnIArbeidsgiverperioden(
  lonnIAP?: LonnIArbeidsgiverperioden,
  arbeidsgiverperioder?: Periode[]
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  const ingenArbeidsgiverperiode =
    arbeidsgiverperioder === undefined ||
    arbeidsgiverperioder?.length === 0 ||
    arbeidsgiverperioder?.filter((p) => p.tom && p.fom).length === 0;

  if (!ingenArbeidsgiverperiode && !lonnIAP?.status) {
    console.log('lonnIAP - 1', lonnIAP);
    console.log('ingenArbeidsgiverperiode', ingenArbeidsgiverperiode);
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_MANGLER,
      felt: 'lia-radio'
    });
  } else {
    if (lonnIAP.status === 'Nei' && (!lonnIAP.begrunnelse || lonnIAP.begrunnelse?.length === 0)) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE,
        felt: 'lia-select'
      });
    }
    if (lonnIAP.status === 'Nei' && ugyldigEllerNegativtTall(lonnIAP.utbetalt)) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BELOP,
        felt: 'lus-uua-input'
      });
    }
    if (ingenArbeidsgiverperiode && lonnIAP.status === 'Ja') {
      console.log('lonnIAP - 2', lonnIAP);
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE,
        felt: 'lia-radio'
      });
    }
  }

  return errorStatus;
}
