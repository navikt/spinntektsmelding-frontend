import ActionType from './actiontype';
import InntektsmeldingSkjema, { Naturalytelse, Periode } from './state';
import { v4 as uuid } from 'uuid';
import { parse } from 'date-fns';

export const initialState: InntektsmeldingSkjema = {
  opplysningerBekreftet: false,
  egenmeldingsperioder: [{ id: uuid() }],
  showBeregnetMaanedsinntektModal: false,
  fravaersperiode: [{ id: uuid() }]
};

export default function (state: InntektsmeldingSkjema, action: ActionType): InntektsmeldingSkjema {
  switch (action.type) {
    case 'leggTilFravaersperiode': {
      const nyFravaersperiode: Periode = { id: uuid() };

      state.fravaersperiode.push(nyFravaersperiode);

      return state;
    }

    case 'slettFravaersperiode': {
      const nyePerioder = state.fravaersperiode.filter((element) => element.id !== action.payload);

      state.fravaersperiode = nyePerioder;

      return state;
    }

    case 'slettAlleFravaersperioder':
      state.fravaersperiode = [{ id: uuid() }];
      return state;

    case 'leggTilEgenmeldingsperiode': {
      const nyEgenmeldingsperiode: Periode = { id: uuid() };

      state.egenmeldingsperioder.push(nyEgenmeldingsperiode);

      return state;
    }

    case 'slettEgenmeldingsperiode': {
      const nyePerioder = state.egenmeldingsperioder.filter((element) => element.id !== action.payload);

      state.egenmeldingsperioder = nyePerioder.length === 0 ? [{ id: uuid() }] : nyePerioder;

      return state;
    }

    case 'slettAlleEgenmeldingsperioder':
      state.egenmeldingsperioder = [{ id: uuid() }];
      return state;

    case 'toggleBetalerArbeidsgiverHeleEllerDeler':
      if (!state.betalerArbeidsgiverHeleEllerDeler) {
        state.betalerArbeidsgiverHeleEllerDeler = { status: action.payload };
      } else state.betalerArbeidsgiverHeleEllerDeler.status = action.payload;
      return state;

    case 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden':
      if (!state.fullLonnIArbeidsgiverPerioden) {
        state.fullLonnIArbeidsgiverPerioden = { status: action.payload };
      } else state.fullLonnIArbeidsgiverPerioden.status = action.payload;
      return state;

    case 'toggleNaturalytelser': {
      if (action.payload === true) {
        const nyNaturalytelseRad: Naturalytelse = {
          id: uuid()
        };

        state.naturalytelser = [nyNaturalytelseRad];
      } else {
        state.naturalytelser = undefined;
      }
      return state;
    }

    case 'slettNaturalytelse': {
      const nyeNaturalytelser = state.naturalytelser!.filter((element) => element.id !== action.payload);
      state.naturalytelser = nyeNaturalytelser;
      return state;
    }

    case 'leggTilNaturalytelseRad': {
      const nyNaturalytelseRad: Naturalytelse = {
        id: uuid()
      };

      state.naturalytelser!.push(nyNaturalytelseRad);

      return state;
    }

    case 'toggleOpplysningerBekreftet': {
      state.opplysningerBekreftet = action.payload;
      return state;
    }

    case 'setEgenmeldingFraDato': {
      state.egenmeldingsperioder = state.egenmeldingsperioder.map((periode) => {
        if (periode.id === action.payload.periodeId) {
          const oppdatertPeriod: Periode = periode;
          oppdatertPeriod.fra = parseIsoDate(action.payload.value);
          return oppdatertPeriod;
        }
        return periode;
      });
      return state;
    }

    case 'setEgenmeldingTilDato': {
      state.egenmeldingsperioder = state.egenmeldingsperioder.map((periode) => {
        if (periode.id === action.payload.periodeId) {
          const oppdatertPeriod: Periode = periode;
          oppdatertPeriod.til = parseIsoDate(action.payload.value);
          return oppdatertPeriod;
        }
        return periode;
      });
      return state;
    }

    case 'setNaturalytelseType': {
      state.naturalytelser = state.naturalytelser?.map((ytelse) => {
        if (ytelse.id === action.payload.ytelseId) {
          const oppdatertYtelse: Naturalytelse = ytelse;
          oppdatertYtelse.type = action.payload.value;
          return oppdatertYtelse;
        }

        return ytelse;
      });
      return state;
    }

    case 'setNaturalytelseDato': {
      state.naturalytelser = state.naturalytelser?.map((ytelse) => {
        if (ytelse.id === action.payload.ytelseId) {
          const oppdatertYtelse: Naturalytelse = ytelse;
          oppdatertYtelse.bortfallsdato = parseIsoDate(action.payload.value);
          return oppdatertYtelse;
        }

        return ytelse;
      });
      return state;
    }

    case 'setNaturalytelseVerdi': {
      state.naturalytelser = state.naturalytelser?.map((ytelse) => {
        if (ytelse.id === action.payload.ytelseId) {
          const oppdatertYtelse: Naturalytelse = ytelse;
          oppdatertYtelse.verdi = Number(action.payload.value);
          return oppdatertYtelse;
        }

        return ytelse;
      });
      return state;
    }

    case 'setOrganisasjonUnderenhet': {
      state.orgnrUnderenhet = action.payload.OrganizationNumber;
      state.virksomhetsnavn = action.payload.Name;
      return state;
    }

    case 'setOppdatertMaanedsinntekt': {
      state.showBeregnetMaanedsinntektModal = false;
      state.bruttoinntekt = {
        bruttoInntekt: action.payload.oppdatertMaanedsinntekt,
        bekreftet: action.payload.oppdatert,
        manueltKorrigert: action.payload.endringsaarsak !== '',
        endringsaarsak: action.payload.endringsaarsak
      };
      return state;
    }

    case 'visBekreftMaanedsinntekt': {
      state.showBeregnetMaanedsinntektModal = true;

      return state;
    }

    default:
      return state;
  }
}
function parseIsoDate(isoDateString: string) {
  return parse(isoDateString, 'yyyy-MM-dd', new Date());
}
