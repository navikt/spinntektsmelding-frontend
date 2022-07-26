import { Organisasjon } from '../components/Banner/Banner';
import { YesNo } from './state';

type ActionType =
  | {
      type: 'toggleBetalerArbeidsgiverHeleEllerDeler';
      payload: { status: YesNo; arbeidsforholdId: string };
    }
  | {
      type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden';
      payload: { status: YesNo; arbeidsforholdId: string };
    }
  | {
      type: 'toggleNaturalytelser';
      payload: boolean;
    }
  | {
      type: 'slettNaturalytelse';
      payload: string;
    }
  | {
      type: 'leggTilNaturalytelseRad';
    }
  | {
      type: 'toggleOpplysningerBekreftet';
      payload: boolean;
    }
  | {
      type: 'toggleRefusjonskravetOpphoerer';
      payload: { status: YesNo; arbeidsforholdId: string };
    }
  | {
      type: 'toggleBekreftKorrektInntekt';
      payload: boolean;
    }
  | {
      type: 'leggTilEgenmeldingsperiode';
      payload: string;
    }
  | {
      type: 'slettEgenmeldingsperiode';
      payload: string;
    }
  | {
      type: 'setEgenmeldingFraDato';
      payload: {
        periodeId: string;
        value: string;
      };
    }
  | {
      type: 'setEgenmeldingTilDato';
      payload: {
        periodeId: string;
        value: string;
      };
    }
  | {
      type: 'setNaturalytelseType';
      payload: {
        ytelseId: string;
        value: string;
      };
    }
  | {
      type: 'setNaturalytelseVerdi';
      payload: {
        ytelseId: string;
        value: string;
      };
    }
  | {
      type: 'setNaturalytelseDato';
      payload: {
        ytelseId: string;
        value: string;
      };
    }
  | {
      type: 'setOrganisasjonUnderenhet';
      payload: Organisasjon;
    }
  | {
      type: 'setOppdatertMaanedsinntekt';
      payload: string;
    }
  | {
      type: 'leggTilFravaersperiode';
      payload: string;
    }
  | {
      type: 'slettFravaersperiode';
      payload: string;
    }
  | {
      type: 'setFravaersperiodeFraDato';
      payload: {
        periodeId: string;
        value: string;
        arbeidsforholdId: string;
      };
    }
  | {
      type: 'setFravaersperiodeTilDato';
      payload: {
        periodeId: string;
        value: string;
        arbeidsforholdId: string;
      };
    }
  | {
      type: 'setRefusjonskravOpphoersdato';
      payload: { value: string; arbeidsforholdId: string };
    }
  | {
      type: 'setBegrunnelseRedusertUtbetaling';
      payload: {
        value: string;
        arbeidsforholdId: string;
      };
    }
  | {
      type: 'fyllFormdata';
      payload: any; // TODO Stram til denne når apiet har satt seg!
    }
  | {
      type: 'submitForm';
    }
  | {
      type: 'tilbakestillFravaersperiode';
      payload: string;
    }
  | {
      type: 'tilbakestillBruttoinntekt';
    }
  | {
      type: 'setBehandlingsdager';
      payload?: Array<Date>;
    }
  | {
      type: 'setArbeidsforhold';
      payload?: Array<string>;
    }
  | {
      type: 'setSammeFravarePaaArbeidsforhold';
      payload: {
        arbeidsforholdId: string;
        set: boolean;
      };
    }
  | {
      type: 'setArbeidsgiverBetalerBelop';
      payload: {
        arbeidsforholdId: string;
        value: string;
      };
    }
  | {
      type: 'endreFravaersperiode';
    }
  | {
      type: 'setEndringsaarsakMaanedsinntekt';
      payload: string;
    };

export default ActionType;
