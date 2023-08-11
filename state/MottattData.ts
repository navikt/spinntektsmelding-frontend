import { HistoriskInntekt } from './state';
import { FeilReportElement } from './useStateInit';

export interface MottattPeriode {
  fom: TDateISODate;
  tom: TDateISODate;
}

interface MottattPeriodeRefusjon extends MottattPeriode {
  beløp: number;
}

export interface MottattNaturalytelse {
  type: string;
  bortfallsdato: string;
  verdi: number;
}

type TDateISODate =
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
      beregningsmaaneder: Array<string>;
    };
  };
  refusjon: {
    paakrevd: boolean;
    forslag: {
      perioder: Array<MottattPeriodeRefusjon>;
      opphoersdato: TDateISODate | null;
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
  behandlingsdager: Array<string>;
  behandlingsperiode: MottattPeriode | null;
  innsenderNavn: string;
  innsenderTelefonNr: string;
  feilReport?: FeilReportFeilListe;
  forespurtData?: ForespurteData;
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
