export interface MottattPeriode {
  fra: string;
  til: string;
}

interface MottattHistoriskInntekt {
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
  fravaersperiode: { [key: string]: Array<MottattPeriode> };
  egenmeldingsperioder: Array<MottattPeriode>;
  bruttoinntekt: number;
  tidligereinntekt: Array<MottattHistoriskInntekt>;
  behandlingsdager: boolean;
  arbeidsforhold: Array<MottattArbeidsforhold>;
}

export default MottattData;
