export interface Periode {
  fra?: Date;
  til?: Date;
  id: string;
}

export type YesNo = 'Ja' | 'Nei';

export interface Inntekt {
  bruttoInntekt: number;
  bekreftet?: boolean;
  manueltKorrigert: boolean;
  endringsaarsak?: string;
}

export interface HistoriskInntekt {
  maanedsnavn: string;
  inntekt: number;
  id: string;
}

export interface LonnISykefravaeret {
  status?: YesNo;
  belop?: number;
}

export interface LonnIArbeidsgiverperioden {
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
  opprinneligfravaersperiode: Array<Periode>;
  egenmeldingsperioder: Array<Periode>;
  bruttoinntekt?: Inntekt;
  opprinneligbruttoinntekt?: Inntekt;
  tidligereinntekt?: Array<HistoriskInntekt>;
  fullLonnIArbeidsgiverPerioden?: LonnIArbeidsgiverperioden;
  lonnISykefravaeret?: LonnISykefravaeret;
  naturalytelser?: Array<Naturalytelse>;
  opplysningerBekreftet: boolean;
  endreMaanedsinntekt: boolean;
  refusjonskravetOpphoerer: boolean;
  refusjonskravOpphoersdato?: Date;
  behandlingsdager: boolean;
}

export default InntektsmeldingSkjema;
