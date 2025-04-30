import { LonnIArbeidsgiverperioden } from '../state/state';
import { tidPeriode } from '../utils/finnBestemmendeFravaersdag';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum LonnIArbeidsgiverperiodenFeilkode {
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER = 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE = 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
  LONN_I_ARBEIDSGIVERPERIODEN_UGYLDIG_BEGRUNNELSE = 'LONN_I_ARBEIDSGIVERPERIODEN_UGYLDIG_BEGRUNNELSE',
  LONN_I_ARBEIDSGIVERPERIODEN_BELOP = 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
  LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE = 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
  LONN_I_ARBEIDSGIVERPERIODEN_BELOP_OVERSTIGER_BRUTTOINNTEKT = 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP_OVERSTIGER_BRUTTOINNTEKT'
}

export default function validerLonnIArbeidsgiverperioden<T extends tidPeriode>(
  lonnIAP?: LonnIArbeidsgiverperioden,
  arbeidsgiverperioder?: T[],
  bruttoInntekt?: number
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  const ingenArbeidsgiverperiode = isIngenArbeidsgiverperiode(arbeidsgiverperioder);

  if (ingenArbeidsgiverperiode) {
    errorStatus = validateIngenArbeidsgiverperiode(errorStatus, lonnIAP);
    return errorStatus;
  }

  errorStatus = validateLonnIAgpStatus(errorStatus, lonnIAP, bruttoInntekt);

  return errorStatus;
}

function isIngenArbeidsgiverperiode<T extends tidPeriode>(arbeidsgiverperioder?: T[]): boolean {
  return (
    arbeidsgiverperioder === undefined ||
    arbeidsgiverperioder?.length === 0 ||
    arbeidsgiverperioder?.filter((p) => p.tom && p.fom).length === 0
  );
}

function validateIngenArbeidsgiverperiode(
  errorStatus: Array<ValiderResultat>,
  lonnIAP?: LonnIArbeidsgiverperioden
): Array<ValiderResultat> {
  if (lonnIAP?.begrunnelse === 'BetvilerArbeidsufoerhet') {
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_UGYLDIG_BEGRUNNELSE,
      felt: 'agp.redusertLoennIAgp.begrunnelse'
    });
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

function validateLonnIAgpStatus(
  errorStatus: Array<ValiderResultat>,
  lonnIAP?: LonnIArbeidsgiverperioden,
  bruttoInntekt?: number
): Array<ValiderResultat> {
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
  }
  return errorStatus;
}
