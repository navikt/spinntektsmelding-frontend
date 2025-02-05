import { LonnIArbeidsgiverperioden, Periode } from '../state/state';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum LonnIArbeidsgiverperiodenFeilkode {
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER = 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE = 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
  LONN_I_ARBEIDSGIVERPERIODEN_BELOP = 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
  LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE = 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
  LONN_I_ARBEIDSGIVERPERIODEN_BELOP_OVERSTIGER_BRUTTOINNTEKT = 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP_OVERSTIGER_BRUTTOINNTEKT'
}

export default function validerLonnIArbeidsgiverperioden(
  lonnIAP?: LonnIArbeidsgiverperioden,
  arbeidsgiverperioder?: Periode[],
  bruttoInntekt?: number
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  const ingenArbeidsgiverperiode = isIngenArbeidsgiverperiode(arbeidsgiverperioder);

  if (ingenArbeidsgiverperiode) {
    errorStatus = validateIngenArbeidsgiverperiode(lonnIAP, errorStatus);
    return errorStatus;
  }

  errorStatus = validateLonnIAPStatus(lonnIAP, bruttoInntekt, ingenArbeidsgiverperiode, errorStatus);

  return errorStatus;
}

function isIngenArbeidsgiverperiode(arbeidsgiverperioder?: Periode[]): boolean {
  return (
    arbeidsgiverperioder === undefined ||
    arbeidsgiverperioder?.length === 0 ||
    arbeidsgiverperioder?.filter((p) => p.tom && p.fom).length === 0
  );
}

function validateIngenArbeidsgiverperiode(
  lonnIAP?: LonnIArbeidsgiverperioden,
  errorStatus?: Array<ValiderResultat>
): Array<ValiderResultat> {
  if (!errorStatus) {
    errorStatus = [];
  }
  if (!lonnIAP?.begrunnelse || lonnIAP?.begrunnelse?.length === 0) {
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE,
      felt: 'agp.redusertLoennIAgp.begrunnelse'
    });
  }
  if (ugyldigEllerNegativtTall(lonnIAP?.utbetalt)) {
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BELOP,
      felt: 'agp.redusertLoennIAgp.beloep'
    });
  }

  if (lonnIAP?.status === 'Ja') {
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE,
      felt: 'lia-radio'
    });
  }
  return errorStatus;
}

function validateLonnIAPStatus(
  lonnIAP?: LonnIArbeidsgiverperioden,
  bruttoInntekt?: number,
  ingenArbeidsgiverperiode?: boolean,
  errorStatus?: Array<ValiderResultat>
): Array<ValiderResultat> {
  if (!errorStatus) {
    errorStatus = [];
  }
  if (!lonnIAP?.status) {
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_MANGLER,
      felt: 'lia-radio'
    });
  } else {
    if (lonnIAP.status === 'Nei' && (!lonnIAP.begrunnelse || lonnIAP.begrunnelse?.length === 0)) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE,
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      });
    }
    if (lonnIAP.status === 'Nei' && ugyldigEllerNegativtTall(lonnIAP.utbetalt)) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BELOP,
        felt: 'agp.redusertLoennIAgp.beloep'
      });
    }

    if (lonnIAP.status === 'Nei' && lonnIAP?.utbetalt && bruttoInntekt && lonnIAP?.utbetalt > bruttoInntekt) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BELOP_OVERSTIGER_BRUTTOINNTEKT,
        felt: 'agp.redusertLoennIAgp.beloep'
      });
    }

    if (ingenArbeidsgiverperiode && lonnIAP.status === 'Ja') {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE,
        felt: 'lia-radio'
      });
    }
  }
  return errorStatus;
}
