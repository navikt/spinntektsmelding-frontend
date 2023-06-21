import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { addDays, isValid, parseISO } from 'date-fns';
import { YesNo } from './state';

type Opplysningstype = 'Inntekt' | 'Refusjon' | 'Arbeidsgiverperiode';

type Beregningsmåneder = string;

type ForslagInntekt = {
  beregningsmåneder: Beregningsmåneder;
};

type PeriodeRefusjon = {
  fom?: Date;
  tom?: Date;
  belop?: number;
};

type MottattPeriodeRefusjon = {
  fom: string;
  tom: string;
  beløp: number;
};

type ForslagRefusjon = Array<PeriodeRefusjon>;

type ForespurteData = {
  opplysningstype: Opplysningstype;
  forslag: ForslagInntekt | ForslagRefusjon;
};

export interface ForespurtDataState {
  forespurtData?: Array<ForespurteData>;
  initForespurtData: (forespurtData: any) => void;
  hentOpplysningstyper: () => Array<string>;
}

const useForespurtDataStore: StateCreator<CompleteState, [], [], ForespurtDataState> = (set, get) => ({
  forespurtData: undefined,
  initForespurtData: (forespurtData) => {
    set(
      produce((state: ForespurtDataState) => {
        const maserteData = forespurtData.map((data) => {
          if (data.opplysningstype === 'Refusjon') {
            const forslagsdata = data.forslag.map((periode: MottattPeriodeRefusjon) => ({
              fom: periode.fom ? parseISO(periode.fom) : undefined,
              tom: periode.tom ? parseISO(periode.tom) : undefined,
              belop: periode.beløp ?? undefined
            }));
            return { ...data, forslag: forslagsdata };
          } else {
            return data;
          }
        });

        state.forespurtData = maserteData;
      })
    );
  },
  hentOpplysningstyper: () => {
    const forespurtData = get().forespurtData;
    if (forespurtData) {
      return forespurtData.map((data) => data.opplysningstype);
    }

    return [];
  },
  hentRefusjoner: () => {
    const forespurtData = get().forespurtData;

    if (forespurtData) {
      const refusjonsdata = forespurtData.find((data) => data.opplysningstype === 'Refusjon');
      const harEndringer =
        refusjonsdata?.forslag && !('beregningsmåneder' in refusjonsdata.forslag) && refusjonsdata.forslag.length > 0;
      const endringer = refusjonsdata!.forslag as ForslagRefusjon;

      const sorterbareEndringer = structuredClone(endringer);

      const sorterteEndringer = sorterbareEndringer.sort((a, b) => {
        if (a.fom! === b.fom!) return 0;
        return a.fom! > b.fom! ? 1 : -1;
      });

      const sisteEndring = sorterteEndringer[sorterteEndringer.length - 1];

      let kravOpphorer: YesNo = 'Nei';
      let kravOpphorerDato = new Date();

      if (sisteEndring.belop === 0) {
        kravOpphorer = 'Ja' as YesNo;
        kravOpphorerDato = sisteEndring.fom!;
        sorterteEndringer.pop();
      } else {
        if (isValid(sisteEndring.tom)) {
          kravOpphorer = 'Ja' as YesNo;
          kravOpphorerDato = addDays(sisteEndring.tom!, 1);
        } else {
          kravOpphorer = 'Nei' as YesNo;
        }
      }

      // kravOpphorer =
      //   kravOpphorer === 'Nei' ? (sisteEndring.belop !== 0 && isValid(sisteEndring.tom) ? 'Ja' : 'Nei') : 'Nei';

      // kravOpphorer === 'Ja'
      //   ? sisteEndring.belop !== 0 && isValid(sisteEndring.tom)
      //     ? addDays(sisteEndring.tom!, 1)
      //     : sisteEndring.tom!
      //   : sisteEndring.tom!;

      return {
        harEndringer,
        endringer: sorterteEndringer,
        kravOpphorer,
        kravOpphorerDato
      };
    }
    return {};
  }
});

export default useForespurtDataStore;
