import { isBefore } from 'date-fns';
import { z } from 'zod';
import useBoundStore from '../state/useBoundStore';
import { RefusjonEndringSchema } from '../schema/RefusjonEndringSchema';

type EndringsBeloep = z.infer<typeof RefusjonEndringSchema>;

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
            beloep: endring.beloep,
            dato: endring.dato
          };
        })
    : refusjonEndringer;
};
export default useRefusjonEndringerUtenSkjaeringstidspunkt;
