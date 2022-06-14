import { Organisasjon } from '../components/Banner/Banner';
import { OppdatertMaanedsintekt } from '../components/BeregnetMaanedsinntekt/BeregnetMaanedsinntekt';
import { YesNo } from './state';

type ActionType =
  | {
      type: 'toggleBetalerArbeidsgiverHeleEllerDeler';
      payload: YesNo;
    }
  | {
      type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden';
      payload: YesNo;
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
      payload: boolean;
    }
  | {
      type: 'toggleBekreftKorrektInntekt';
      payload: boolean;
    }
  | {
      type: 'leggTilEgenmeldingsperiode';
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
      };
    }
  | {
      type: 'setFravaersperiodeTilDato';
      payload: {
        periodeId: string;
        value: string;
      };
    }
  | {
      type: 'setRefusjonskravOpphoersdato';
      payload: string;
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
    }
  | {
      type: 'tilbakestillBruttoinntekt';
    }
  | {
      type: 'setBehandlingsdager';
      payload?: Array<Date>;
    }
  | {
      type: 'setEndringsaarsakMaanedsinntekt';
      payload: string;
    };

export default ActionType;
