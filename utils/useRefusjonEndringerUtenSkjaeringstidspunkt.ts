import { isBefore } from 'date-fns';
import useBoundStore from '../state/useBoundStore';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';

const useRefusjonEndringerUtenSkjaeringstidspunkt = (): EndringsBeloep[] | undefined => {
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);

  return gammeltSkjaeringstidspunkt && refusjonEndringer
    ? refusjonEndringer
        ?.filter((endring) => {
          if (!endring.dato) return false;
          return !isBefore(endring.dato, gammeltSkjaeringstidspunkt);
        })
        .map((endring) => {
          return {
            beloep: endring.beloep ?? endring.beloep,
            dato: endring.dato
          };
        })
    : refusjonEndringer;
};
export default useRefusjonEndringerUtenSkjaeringstidspunkt;
