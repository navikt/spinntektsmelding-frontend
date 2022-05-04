export interface Periode {
  fra?: Date;
  til?: Date;
  id: string;
}

export type YesNo = 'Ja' | 'Nei';

interface Inntekt {
  bruttoInntekt: number;
  bekreftet: boolean;
  manueltKorrigert: boolean;
  endringsaarsak: string;
}

interface FullLonnIArbeidsgiverPerioden {
  status?: YesNo;
  belop?: number;
}

interface BetalerArbeidsgiverHeleEllerDeler {
  status?: YesNo;
  begrunnelse?: string;
}

export interface Naturalytelse {
  id: string;
  type?: string;
  bortfallsdato?: Date;
  verdi?: number;
}

interface InntektsmeldingSkjema {
  navn?: string;
  identitetsnummer?: string;
  virksomhetsnavn?: string;
  orgnrUnderenhet?: string;
  fravaersperiode: Array<Periode>;
  egenmeldingsperioder: Array<Periode>;
  bruttoinntekt?: Inntekt;
  fullLonnIArbeidsgiverPerioden?: FullLonnIArbeidsgiverPerioden;
  betalerArbeidsgiverHeleEllerDeler?: BetalerArbeidsgiverHeleEllerDeler;
  naturalytelser?: Array<Naturalytelse>;
  opplysningerBekreftet: boolean;
  showBeregnetMaanedsinntektModal: boolean;
}

export default InntektsmeldingSkjema;
