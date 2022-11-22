export interface MottattPeriode {
  fra: string;
  til: string;
}

export interface MottattNaturalytelse {
  type: string;
  bortfallsdato: string;
  verdi: number;
}

export interface MottattHistoriskInntekt {
  maanedsnavn: string;
  inntekt: number;
}

export interface MottattArbeidsforhold {
  arbeidsforholdId: string;
  arbeidsforhold: string;
  stillingsprosent: number;
}

interface MottattData {
  navn: string;
  identitetsnummer: string;
  virksomhetsnavn: string;
  orgnrUnderenhet: string;
  fravaersperioder: Array<MottattPeriode>;
  egenmeldingsperioder: Array<MottattPeriode>;
  bruttoinntekt: number;
  tidligereinntekt: Array<MottattHistoriskInntekt>;
  behandlingsdager: Array<string>;
  behandlingsperiode: MottattPeriode;
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
