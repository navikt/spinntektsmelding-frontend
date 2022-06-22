import ActionType from './actiontype';
import InntektsmeldingSkjema, { Naturalytelse, Periode } from './state';
import { v4 as uuid } from 'uuid';
import { parse, parseISO } from 'date-fns';
import MottattData from './MottattData';

export const initialState: InntektsmeldingSkjema = {
  opplysningerBekreftet: false,
  egenmeldingsperioder: [{ id: uuid() }],
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
  behandlingsdager: false,
  sammeFravaersperiode: false
};

export default function formReducer(orgState: InntektsmeldingSkjema, action: ActionType): InntektsmeldingSkjema {
  const state = structuredClone(orgState);

  switch (action.type) {
    case 'leggTilFravaersperiode': {
      const nyFravaersperiode: Periode = { id: uuid() };
      if (state.fravaersperiode) {
        if (!state.fravaersperiode[action.payload]) {
          state.fravaersperiode[action.payload] = [];
        }
      } else {
        state.fravaersperiode = {};
        state.fravaersperiode[action.payload] = [];
      }
      state.fravaersperiode[action.payload].push(nyFravaersperiode);

      return state;
    }

    case 'slettFravaersperiode': {
      if (state.fravaersperiode) {
        const ansattforholdId: Array<string> = Object.keys(state.fravaersperiode);
        ansattforholdId.forEach((forholdId) => {
          if (state.fravaersperiode && state.fravaersperiode[forholdId]) {
            const nyePerioder = state.fravaersperiode[forholdId].filter((element) => element.id !== action.payload);
            state.fravaersperiode[forholdId] = nyePerioder;
          }
        });
      }

      return state;
    }

    case 'setFravaersperiodeFraDato': {
      if (state.fravaersperiode && state.fravaersperiode[action.payload.arbeidsforholdId]) {
        state.fravaersperiode[action.payload.arbeidsforholdId] = state.fravaersperiode[
          action.payload.arbeidsforholdId
        ].map((periode) => {
          if (periode.id === action.payload.periodeId) {
            periode.fra = parseIsoDate(action.payload.value);
          }
          return periode;
        });
      }
      return state;
    }

    case 'setFravaersperiodeTilDato': {
      if (state.fravaersperiode && state.fravaersperiode[action.payload.arbeidsforholdId]) {
        state.fravaersperiode[action.payload.arbeidsforholdId] = state.fravaersperiode[
          action.payload.arbeidsforholdId
        ].map((periode) => {
          if (periode.id === action.payload.periodeId) {
            periode.til = parseIsoDate(action.payload.value);
          }
          return periode;
        });
      }
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
      state.opprinneligbruttoinntekt = structuredClone(state.bruttoinntekt);
      const fravaersKeys = Object.keys(fdata.fravaersperiode) || [];

      if (fravaersKeys.length > 0) {
        state.fravaersperiode = {};
        fravaersKeys.forEach((fKeys) => {
          state.fravaersperiode[fKeys] = fdata.fravaersperiode[fKeys].map((periode) => {
            return {
              fra: parseISO(periode.fra),
              til: parseISO(periode.til),
              id: uuid()
            };
          });
        });
      }

      state.opprinneligfravaersperiode = structuredClone({ ...state.fravaersperiode });

      state.tidligereinntekt = fdata.tidligereinntekt.map((inntekt) => ({
        maanedsnavn: inntekt.maanedsnavn,
        inntekt: inntekt.inntekt,
        id: uuid()
      }));

      state.behandlingsdager = fdata.behandlingsdager;

      state.arbeidsforhold = fdata.arbeidsforhold.map((forhold) => ({
        arbeidsforholdId: forhold.arbeidsforholdId,
        arbeidsforhold: forhold.arbeidsforhold,
        stillingsprosent: forhold.stillingsprosent,
        aktiv: true
      }));
      return state;
    }

    case 'tilbakestillFravaersperiode': {
      if (
        state.fravaersperiode &&
        state.fravaersperiode[action.payload] &&
        state.opprinneligfravaersperiode &&
        state.opprinneligfravaersperiode[action.payload]
      ) {
        const clone = structuredClone(state.opprinneligfravaersperiode[action.payload]);
        state.fravaersperiode[action.payload] = clone;
      }
      return state;
    }

    case 'tilbakestillBruttoinntekt': {
      state.bruttoinntekt = JSON.parse(JSON.stringify(state.opprinneligbruttoinntekt));
      return state;
    }

    case 'setArbeidsforhold': {
      const oppdaterteForhold = state.arbeidsforhold?.map((forhold) => {
        const aktiv = Boolean(action.payload && action.payload.indexOf(forhold.arbeidsforholdId) > -1);
        forhold.aktiv = aktiv;
        return forhold;
      });

      state.arbeidsforhold = oppdaterteForhold;
      return state;
    }

    case 'setSammeFravarePaaArbeidsforhold': {
      const fravaersKeys = Object.keys(state.fravaersperiode!);
      if (state.fravaersperiode && fravaersKeys.indexOf(action.payload.arbeidsforholdId) > -1) {
        state.sammeFravaersperiode = true;
      }

      if (state.fravaersperiode && state.fravaersperiode[action.payload.arbeidsforholdId]) {
        const periodeMaster: Periode[] = state.fravaersperiode[action.payload.arbeidsforholdId];

        const oppdaterbarePerioder = fravaersKeys.filter((key) => key !== action.payload.arbeidsforholdId);

        oppdaterbarePerioder.forEach((arbeidsforholdId) => {
          if (arbeidsforholdId !== action.payload.arbeidsforholdId) {
            state.fravaersperiode![arbeidsforholdId] = periodeMaster.map((periode) => {
              return {
                ...periode,
                id: uuid()
              };
            });
          }
        });
      }

      state.sammeFravaersperiode = action.payload.set;

      return state;
    }

    case 'endreFravaersperiode': {
      state.sammeFravaersperiode = false;

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
