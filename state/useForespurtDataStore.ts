import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { parseISO } from 'date-fns';
import { YesNo } from './state';

export type Opplysningstype = 'inntekt' | 'refusjon' | 'arbeidsgiverperiode';

type Beregningsmåneder = string;

type ForslagInntekt = {
  beregningsmåneder: Beregningsmåneder;
};

type PeriodeRefusjon = {
  fom: Date;
  tom?: Date;
  belop: number;
};

type MottattPeriodeRefusjon = {
  fom: string;
  tom: string;
  beløp: number;
};

type ForslagRefusjon = Array<PeriodeRefusjon>;

type MottattForslagRefusjon = Array<MottattPeriodeRefusjon>;

type ForespurtData = {
  paakrevd: boolean;
  forslag: ForslagInntekt & ForslagRefusjon;
};

// type MottattForespurtData = {
//   opplysningstype: Opplysningstype;
//   forslag: ForslagInntekt & MottattForslagRefusjon;
// };

type MottattForespurtData = {
  [key in Opplysningstype]: ForespurtData;
};

export interface ForespurtDataState {
  forespurtData?: MottattForespurtData;
  initForespurtData: (forespurtData: MottattForespurtData) => void;
  hentOpplysningstyper: () => Array<Opplysningstype>;
  hentPaakrevdOpplysningstyper: () => Array<Opplysningstype> | Array<undefined>;
  hentRefusjoner: () => {
    harEndringer: boolean;
    endringer: Array<PeriodeRefusjon>;
    kravOpphorer: YesNo;
    kravOpphorerDato: Date;
  };
}

const useForespurtDataStore: StateCreator<CompleteState, [], [], ForespurtDataState> = (set, get) => ({
  forespurtData: undefined,
  initForespurtData: (forespurtData) => {
    set(
      produce((state: ForespurtDataState) => {
        state.forespurtData = forespurtData;

        return state;
      })
    );
  },
  hentOpplysningstyper: () => {
    const forespurtData = get().forespurtData;
    if (forespurtData) {
      return Object.keys(forespurtData) as Array<Opplysningstype>;
    }

    return [];
  },
  hentPaakrevdOpplysningstyper: () => {
    const forespurtData = get().forespurtData;
    if (forespurtData) {
      return Object.keys(forespurtData).filter(
        (key) => forespurtData[key as keyof typeof forespurtData].paakrevd
      ) as Array<Opplysningstype>;
    }

    return [];
  },

  hentRefusjoner: () => {
    const forespurtData = get().forespurtData;
    if (forespurtData) {
      const refusjonsdata = forespurtData['refusjon' as keyof typeof forespurtData];

      let harEndringer = refusjonsdata?.forslag.perioder && refusjonsdata.forslag.perioder.length > 0;
      const endringer = refusjonsdata.forslag.perioder;

      const sorterbareEndringer = endringer.map((periode: MottattPeriodeRefusjon) => ({
        fom: periode.fom ? parseISO(periode.fom) : undefined,
        tom: periode.tom ? parseISO(periode.tom) : undefined,
        belop: periode.beløp || undefined
      }));

      const sorterteEndringer = sorterbareEndringer?.sort((a, b) => {
        if (a.fom! === b.fom!) return 0;
        return a.fom! > b.fom! ? 1 : -1;
      });

      let kravOpphorer: YesNo = !!refusjonsdata?.forslag?.opphoersdato ? 'Ja' : 'Nei';
      let kravOpphorerDato =
        sorterbareEndringer?.forslag?.opphoersdato || sorterteEndringer[sorterteEndringer.length - 1].tom; //new Date();

      return {
        harEndringer: harEndringer ?? false,
        endringer: sorterteEndringer ?? [],
        kravOpphorer,
        kravOpphorerDato
      };
    }
    return {
      harEndringer: 'Nei',
      endringer: [],
      kravOpphorer: 'Nei',
      kravOpphorerDato: null
    };
  }
});

export default useForespurtDataStore;
