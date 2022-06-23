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

export interface IArbeidsforhold {
  arbeidsforholdId: string;
  arbeidsforhold: string;
  stillingsprosent: number;
  aktiv: boolean;
}

export interface RefusjonskravetOpphoerer {
  status?: boolean;
  opphorsdato?: Date;
}

interface InntektsmeldingSkjema {
  navn?: string;
  identitetsnummer?: string;
  virksomhetsnavn?: string;
  orgnrUnderenhet?: string;
  fravaersperiode?: { [key: string]: Array<Periode> };
  opprinneligfravaersperiode?: { [key: string]: Array<Periode> };
  egenmeldingsperioder: { [key: string]: Array<Periode> };
  bruttoinntekt?: Inntekt;
  opprinneligbruttoinntekt?: Inntekt;
  tidligereinntekt?: Array<HistoriskInntekt>;
  fullLonnIArbeidsgiverPerioden?: { [key: string]: LonnIArbeidsgiverperioden };
  lonnISykefravaeret?: { [key: string]: LonnISykefravaeret };
  naturalytelser?: Array<Naturalytelse>;
  opplysningerBekreftet: boolean;
  refusjonskravetOpphoerer?: { [key: string]: RefusjonskravetOpphoerer };
  refusjonskravOpphoersdato?: Date;
  behandlingsdager: boolean;
  arbeidsforhold?: Array<IArbeidsforhold>;
  sammeFravaersperiode: boolean;
}

export default InntektsmeldingSkjema;
