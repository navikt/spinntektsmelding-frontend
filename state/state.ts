export interface Periode {
  fom?: Date;
  tom?: Date;
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

export interface IArbeidsforhold {
  arbeidsforholdId: string;
  arbeidsforhold: string;
  stillingsprosent: number;
  aktiv: boolean;
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
  arbeidsforhold?: Array<IArbeidsforhold>;
  sammeFravaersperiode: boolean;
}

export default InntektsmeldingSkjema;
