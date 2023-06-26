import { HistoriskInntekt } from './state';
import { FeilReportElement } from './useStateInit';

export interface MottattPeriode {
  fom: string;
  tom: string;
}

export interface MottattNaturalytelse {
  type: string;
  bortfallsdato: string;
  verdi: number;
}

interface MottattData {
  navn: string;
  identitetsnummer: string;
  orgNavn: string;
  orgnrUnderenhet: string;
  fravaersperioder: Array<MottattPeriode>;
  egenmeldingsperioder: Array<MottattPeriode>;
  bruttoinntekt: number;
  tidligereinntekter: Array<HistoriskInntekt>;
  behandlingsdager: Array<string>;
  behandlingsperiode: MottattPeriode;
  innsenderNavn: string;
  innsenderTelefonNr: string;
  feilReport: Array<FeilReportElement>;
}

export default MottattData;

export interface MottatArbeidsgiver {
  name: string;
  type: string;
  parentOrganizationNumber?: string | null;
  organizationForm: string;
  organizationNumber: string;
  socialSecurityNumber?: string | null;
  status: string;
}
