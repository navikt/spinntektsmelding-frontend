export interface Periode {
  fom?: Date | undefined;
  tom?: Date | undefined;
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
}

export interface LonnISykefravaeret {
  status?: YesNo;
  belop?: number;
}

export interface LonnIArbeidsgiverperioden {
  status?: YesNo;
  begrunnelse?: string;
  utbetalt?: number;
}

export interface Naturalytelse {
  id: string;
  type?: string;
  bortfallsdato?: Date;
  verdi?: number;
}

export interface RefusjonskravetOpphoerer {
  status?: YesNo;
  opphorsdato?: Date;
}

interface InntektsmeldingSkjema {
  navn?: string;
  identitetsnummer?: string;
  virksomhetsnavn?: string;
  orgnrUnderenhet?: string;
  fravaersperioder?: Array<Periode>;
  opprinneligfravaersperioder?: Array<Periode>;
  egenmeldingsperioder: Array<Periode>;
  bruttoinntekt?: Inntekt;
  opprinneligbruttoinntekt?: Inntekt;
  tidligereinntekt?: Array<HistoriskInntekt>;
  fullLonnIArbeidsgiverPerioden?: LonnIArbeidsgiverperioden;
  lonnISykefravaeret?: LonnISykefravaeret;
  naturalytelser?: Array<Naturalytelse>;
  hasBortfallAvNaturalytelser?: YesNo;
  opplysningerBekreftet: boolean;
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  refusjonskravOpphoersdato?: Date;
  behandlingsdager?: Array<Date>;
  behandlingsperiode?: Periode;
  sammeFravaersperiode: boolean;
  aarsakInnsending: boolean;
}

export default InntektsmeldingSkjema;
