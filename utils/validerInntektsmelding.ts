import { BruttoinntektFeilkode } from '../validators/validerBruttoinntekt';
import { PeriodeFeilkode } from '../validators/validerPeriode';
import { FullLonnIArbeidsgiverPerioden } from '../validators/validerFullLonnIArbeidsgiverPerioden';
import { FullLonnISykefravaeret } from '../validators/validerLonnISykefravaeret';
import { NaturalytelserFeilkoder } from '../validators/validerNaturalytelser';
import { LonnIArbeidsgiverperiodenFeilkode } from '../validators/validerLonnIArbeidsgiverperioden';
import { LonnUnderSykefravaeretFeilkode } from '../validators/validerLonnUnderSykefravaeret';
import { PeriodeEgenmeldingFeilkode } from '../validators/validerPeriodeEgenmelding';
import { BekreftOpplysningerFeilkoder } from '../validators/validerBekreftOpplysninger';
import { EndringAvMaanedslonnFeilkode } from '../validators/validerEndringAvMaanedslonn';
import { TelefonFeilkode } from '../validators/validerTelefon';
import { PeriodeFravaerFeilkode } from '../validators/validerPeriodeFravaer';
import { PeriodeOverlappFeilkode } from '../validators/validerPeriodeOverlapp';

export interface ValiderTekster {
  felt: string;
  text: string;
}

export interface ValiderResultat {
  felt: string;
  code: codeUnion;
}

enum ErrorCodes {
  INGEN_ARBEIDSFORHOLD = 'INGEN_ARBEIDSFORHOLD',
  INGEN_FRAVAERSPERIODER = 'INGEN_FRAVAERSPERIODER',
  INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN = 'INGEN_FULL_LONN_I_ARBEIDSGIVERPERIODEN',
  INGEN_LONN_I_SYKEFRAVAERET = 'INGEN_LONN_I_SYKEFRAVAERET'
}

type codeUnion =
  | PeriodeFeilkode
  | BruttoinntektFeilkode
  | ErrorCodes
  | FullLonnIArbeidsgiverPerioden
  | FullLonnISykefravaeret
  | NaturalytelserFeilkoder
  | LonnIArbeidsgiverperiodenFeilkode
  | LonnUnderSykefravaeretFeilkode
  | BekreftOpplysningerFeilkoder
  | EndringAvMaanedslonnFeilkode
  | PeriodeEgenmeldingFeilkode
  | PeriodeFravaerFeilkode
  | TelefonFeilkode
  | PeriodeOverlappFeilkode;
