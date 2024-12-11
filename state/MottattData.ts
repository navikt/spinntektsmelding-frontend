import { HistoriskInntekt } from './state';
import { MottattForespurtData } from './useForespurtDataStore';
import { FeilReportElement } from './useStateInit';

export interface MottattPeriode {
  fom: TDateISODate;
  tom: TDateISODate;
}

export interface MottattPeriodeRefusjon extends MottattPeriode {
  beloep: number;
}

export interface MottattNaturalytelse {
  type: string;
  bortfallsdato: string;
  verdi: number;
}

export type TDateISODate =
  | `${number}-${number}-${number}`
  | `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

type FeilReportFeilListe = {
  feil: Array<FeilReportElement>;
};

type ForespurteData = {
  arbeidsgiverperiode: { paakrevd: boolean };
  inntekt: {
    paakrevd: boolean;
    forslag: {
      type: string;
      beregningsmaaneder?: Array<string>;
      forrigeInntekt?: {
        skjæringstidspunkt: TDateISODate;
        kilde: string;
        beløp: number;
      };
    };
  };
  refusjon: {
    paakrevd: boolean;
    forslag: {
      perioder: Array<MottattPeriodeRefusjon>;
      opphoersdato?: TDateISODate | null;
      refundert?: number;
    };
  };
};

interface MottattData {
  navn: string;
  identitetsnummer: string;
  orgNavn: string;
  orgnrUnderenhet: string;
  fravaersperioder: Array<MottattPeriode>;
  egenmeldingsperioder: Array<MottattPeriode>;
  bruttoinntekt: number;
  tidligereinntekter: Array<HistoriskInntekt>;
  innsenderNavn: string;
  telefonnummer?: string;
  feilReport?: FeilReportFeilListe;
  forespurtData?: MottattForespurtData;
  skjaeringstidspunkt: TDateISODate;
  eksternBestemmendeFravaersdag: TDateISODate;
  bestemmendeFravaersdag: TDateISODate;
  opprettetUpresisIkkeBruk?: TDateISODate;
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
