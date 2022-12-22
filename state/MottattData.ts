export interface MottattPeriode {
  fom: string;
  tom: string;
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
  tidligereinntekter: Array<MottattHistoriskInntekt>;
  behandlingsdager: Array<string>;
  behandlingsperiode: MottattPeriode;
}

export default MottattData;

export interface MottatArbeidsgiver {
  navn: string;
  type: string;
  orgnrHovedenhet?: string | null;
  orgForm: string;
  orgnr: string;
  status: string;
}
