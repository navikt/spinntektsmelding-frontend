import ActionType from './actiontype';
import InntektsmeldingSkjema, { Naturalytelse, Periode } from './state';
import { nanoid } from 'nanoid';
import { parse, parseISO } from 'date-fns';
import MottattData from './MottattData';
import stringishToNumber from '../utils/stringishToNumber';

export const initialState: InntektsmeldingSkjema = {
  opplysningerBekreftet: false,
  egenmeldingsperioder: { ukjent: [{ id: nanoid() }] },
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
  sammeFravaersperiode: false
};

export default function formReducer(orgState: InntektsmeldingSkjema, action: ActionType): InntektsmeldingSkjema {
  const state = structuredClone(orgState);

  switch (action.type) {
    case 'leggTilFravaersperiode': {
      const nyFravaersperiode: Periode = { id: nanoid() };
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
        const arbeidsforholdId: Array<string> = Object.keys(state.fravaersperiode);
        arbeidsforholdId.forEach((forholdId) => {
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
      const nyEgenmeldingsperiode: Periode = { id: nanoid() };
      if (!state.egenmeldingsperioder) {
        state.egenmeldingsperioder = {};
      }

      if (state.egenmeldingsperioder[action.payload]) {
        state.egenmeldingsperioder[action.payload].push(nyEgenmeldingsperiode);
      } else {
        state.egenmeldingsperioder[action.payload] = [nyEgenmeldingsperiode];
      }

      return state;
    }

    case 'slettEgenmeldingsperiode': {
      const forholdKeys = Object.keys(state.egenmeldingsperioder);

      forholdKeys.forEach((forholdKey) => {
        const nyePerioder = state.egenmeldingsperioder[forholdKey].filter((element) => element.id !== action.payload);
        state.egenmeldingsperioder[forholdKey] = nyePerioder.length === 0 ? [{ id: nanoid() }] : nyePerioder;
      });

      return state;
    }

    case 'toggleBetalerArbeidsgiverHeleEllerDeler': {
      if (!state.lonnISykefravaeret) {
        state.lonnISykefravaeret = {};
      }
      if (!state.lonnISykefravaeret[action.payload.arbeidsforholdId]) {
        state.lonnISykefravaeret[action.payload.arbeidsforholdId] = { status: action.payload.status };
      } else {
        state.lonnISykefravaeret[action.payload.arbeidsforholdId].status = action.payload.status;
      }
      return state;
    }

    case 'setArbeidsgiverBetalerBelop': {
      if (!state.lonnISykefravaeret) {
        state.lonnISykefravaeret = {};
      }
      if (!state.lonnISykefravaeret[action.payload.arbeidsforholdId]) {
        state.lonnISykefravaeret[action.payload.arbeidsforholdId] = { belop: stringishToNumber(action.payload.value) };
      } else {
        state.lonnISykefravaeret[action.payload.arbeidsforholdId].belop = stringishToNumber(action.payload.value);
      }
      return state;
    }

    case 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden':
      if (!state.fullLonnIArbeidsgiverPerioden) {
        state.fullLonnIArbeidsgiverPerioden = {};
      }

      if (!state.fullLonnIArbeidsgiverPerioden[action.payload.arbeidsforholdId]) {
        state.fullLonnIArbeidsgiverPerioden[action.payload.arbeidsforholdId] = { status: action.payload.status };
      } else state.fullLonnIArbeidsgiverPerioden[action.payload.arbeidsforholdId].status = action.payload.status;

      return state;

    case 'toggleNaturalytelser': {
      if (action.payload === true) {
        const nyNaturalytelseRad: Naturalytelse = {
          id: nanoid()
        };

        state.naturalytelser = [nyNaturalytelseRad];
        state.hasBortfallAvNaturalytelser = 'Ja';
      } else {
        state.naturalytelser = undefined;
        state.hasBortfallAvNaturalytelser = 'Nei';
      }
      return state;
    }

    case 'toggleRefusjonskravetOpphoerer':
      if (state.refusjonskravetOpphoerer?.[action.payload.arbeidsforholdId]) {
        state.refusjonskravetOpphoerer[action.payload.arbeidsforholdId].status = action.payload.status;
      } else {
        if (!state.refusjonskravetOpphoerer) {
          state.refusjonskravetOpphoerer = {};
        }
        state.refusjonskravetOpphoerer[action.payload.arbeidsforholdId] = {
          status: action.payload.status
        };
      }
      return state;

    case 'setRefusjonskravOpphoersdato': {
      if (state.refusjonskravetOpphoerer?.[action.payload.arbeidsforholdId]) {
        state.refusjonskravetOpphoerer[action.payload.arbeidsforholdId].opphorsdato = parseIsoDate(
          action.payload.value
        );
      } else {
        if (!state.refusjonskravetOpphoerer) {
          state.refusjonskravetOpphoerer = {};
        }
        state.refusjonskravetOpphoerer[action.payload.arbeidsforholdId] = {
          opphorsdato: parseIsoDate(action.payload.value)
        };
      }

      return state;
    }

    case 'setBegrunnelseRedusertUtbetaling': {
      if (state.fullLonnIArbeidsgiverPerioden?.[action.payload.arbeidsforholdId]) {
        state.fullLonnIArbeidsgiverPerioden[action.payload.arbeidsforholdId].begrunnelse = action.payload.value;
      } else {
        if (!state.fullLonnIArbeidsgiverPerioden) {
          state.fullLonnIArbeidsgiverPerioden = {};
        }
        state.fullLonnIArbeidsgiverPerioden[action.payload.arbeidsforholdId] = { begrunnelse: action.payload.value };
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
        id: nanoid()
      };

      if (!state.naturalytelser) {
        state.naturalytelser = [];
      }

      state.naturalytelser.push(nyNaturalytelseRad);

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
      const forholdKeys = Object.keys(state.egenmeldingsperioder);

      forholdKeys.forEach((forholdKey) => {
        state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode) => {
          if (periode.id === action.payload.periodeId) {
            periode.fra = parseIsoDate(action.payload.value);
            return periode;
          }
          return periode;
        });
      });
      return state;
    }

    case 'setEgenmeldingTilDato': {
      const forholdKeys = Object.keys(state.egenmeldingsperioder);

      forholdKeys.forEach((forholdKey) => {
        state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode) => {
          if (periode.id === action.payload.periodeId) {
            periode.til = parseIsoDate(action.payload.value);
            return periode;
          }
          return periode;
        });
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

      state.behandlingsdager = fdata.behandlingsdager;
      if (fdata.behandlingsperiode) {
        state.behandlingsperiode = {
          fra: parseISO(fdata.behandlingsperiode.fra),
          til: parseISO(fdata.behandlingsperiode.til),
          id: nanoid()
        };
      }

      state.egenmeldingsperioder = {};
      fdata.arbeidsforhold.forEach((forhold) => {
        state.egenmeldingsperioder[forhold.arbeidsforholdId] = [{ id: nanoid() }];
      });

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
                id: nanoid()
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
