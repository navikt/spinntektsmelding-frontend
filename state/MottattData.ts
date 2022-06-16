export interface MottattPeriode {
  fra: string;
  til: string;
}

interface MottattHistoriskInntekt {
  maanedsnavn: string;
  inntekt: number;
}

interface MottattData {
  navn: string;
  identitetsnummer: string;
  virksomhetsnavn: string;
  orgnrUnderenhet: string;
  fravaersperiode: Array<MottattPeriode>;
  egenmeldingsperioder: Array<MottattPeriode>;
  bruttoinntekt: number;
  tidligereinntekt: Array<MottattHistoriskInntekt>;
  behandlingsdager: boolean;
}

export default MottattData;
