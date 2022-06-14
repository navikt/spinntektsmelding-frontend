import ActionType from './actiontype';
import InntektsmeldingSkjema, { Naturalytelse, Periode } from './state';
import { v4 as uuid } from 'uuid';
import { parse, parseISO } from 'date-fns';
import MottattData from './MottattData';

export const initialState: InntektsmeldingSkjema = {
  opplysningerBekreftet: false,
  egenmeldingsperioder: [{ id: uuid() }],
  fravaersperiode: [{ id: uuid() }],
  opprinneligfravaersperiode: [{ id: uuid() }],
  refusjonskravetOpphoerer: false,
  bruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: ''
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: ''
  },
  behandlingsdager: false
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

    case 'setFravaersperiodeFraDato': {
      state.fravaersperiode = state.fravaersperiode.map((periode) => {
        if (periode.id === action.payload.periodeId) {
          periode.fra = parseIsoDate(action.payload.value);
        }
        return periode;
      });
      return state;
    }

    case 'setFravaersperiodeTilDato': {
      state.fravaersperiode = state.fravaersperiode.map((periode) => {
        if (periode.id === action.payload.periodeId) {
          periode.til = parseIsoDate(action.payload.value);
        }
        return periode;
      });
      return state;
    }

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

    case 'toggleBetalerArbeidsgiverHeleEllerDeler':
      if (!state.lonnISykefravaeret) {
        state.lonnISykefravaeret = { status: action.payload };
      } else state.lonnISykefravaeret.status = action.payload;
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

    case 'toggleRefusjonskravetOpphoerer':
      state.refusjonskravetOpphoerer = action.payload;
      return state;

    case 'setRefusjonskravOpphoersdato': {
      state.refusjonskravOpphoersdato = parseIsoDate(action.payload);
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

    case 'toggleBekreftKorrektInntekt': {
      state.bruttoinntekt!.bekreftet = action.payload;

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
      state.bruttoinntekt!.bruttoInntekt = Number(action.payload);
      state.bruttoinntekt!.manueltKorrigert = true;

      return state;
    }

    case 'setEndringsaarsakMaanedsinntekt': {
      state.bruttoinntekt!.endringsaarsak = action.payload;
      state.bruttoinntekt!.manueltKorrigert = true;
      return state;
    }

    case 'fyllFormdata': {
      const fdata: MottattData = action.payload;
      state.navn = fdata.navn;
      state.identitetsnummer = fdata.identitetsnummer;
      state.orgnrUnderenhet = fdata.orgnrUnderenhet;
      state.bruttoinntekt = {
        bruttoInntekt: fdata.bruttoinntekt,
        bekreftet: false,
        manueltKorrigert: false,
        endringsaarsak: ''
      };
      state.opprinneligbruttoinntekt = JSON.parse(JSON.stringify(state.bruttoinntekt));
      state.fravaersperiode = fdata.fravaersperiode.map((periode) => {
        return {
          fra: parseISO(periode.fra),
          til: parseISO(periode.til),
          id: uuid()
        };
      });

      state.opprinneligfravaersperiode = state.fravaersperiode.map((periode) => periode);

      state.tidligereinntekt = fdata.tidligereinntekt.map((inntekt) => ({
        maanedsnavn: inntekt.maanedsnavn,
        inntekt: inntekt.inntekt,
        id: uuid()
      }));

      state.behandlingsdager = fdata.behandlingsdager;
      return state;
    }

    case 'tilbakestillFravaersperiode': {
      state.fravaersperiode = state.opprinneligfravaersperiode.map((periode) => periode);
      return state;
    }

    case 'tilbakestillBruttoinntekt': {
      state.bruttoinntekt = JSON.parse(JSON.stringify(state.opprinneligbruttoinntekt));
      return state;
    }

    case 'submitForm': {
      return state;
    }

    default:
      return state;
  }
}
function parseIsoDate(isoDateString: string): Date {
  return parse(isoDateString, 'yyyy-MM-dd', new Date());
}
