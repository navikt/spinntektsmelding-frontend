import { isBefore, isValid, startOfDay } from 'date-fns';
import { RefusjonEndringSchema } from '../schema/RefusjonEndringSchema';
import { LonnISykefravaeret } from '../state/state';
import parseIsoDate from './parseIsoDate';

interface Refusjon {
  beloepPerMaaned?: number | null;
  endringer?: ReadonlyArray<{ startdato: string | Date; beloep: number }> | null;
}

export function lagRefusjonVisning(
  refusjon: Refusjon | null | undefined,
  bestemmendeFravaersdag: string | Date | undefined
) {
  const fravaersdag = parseIsoDate(bestemmendeFravaersdag);
  if (fravaersdag && !isValid(fravaersdag)) {
    throw new Error('Ugyldig bestemmende fraværsdag ved visning av refusjon');
  }
  const fraDato = fravaersdag ? startOfDay(fravaersdag) : undefined;

  const loenn: LonnISykefravaeret = {
    status: refusjon?.beloepPerMaaned !== undefined && refusjon.beloepPerMaaned !== null ? 'Ja' : 'Nei',
    beloep: refusjon?.beloepPerMaaned ?? undefined
  };
  const endringer = (refusjon?.endringer ?? [])
    .map((endring) =>
      RefusjonEndringSchema.parse({
        beloep: endring.beloep,
        startdato: parseIsoDate(endring.startdato)
      })
    )
    .filter((endring) => !fraDato || !isBefore(startOfDay(endring.startdato), fraDato));

  return { loenn, endringer };
}
