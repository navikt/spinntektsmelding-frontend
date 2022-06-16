import { differenceInCalendarDays, getWeek } from 'date-fns';

export enum valideringBehandlingsdager {
  OK,
  FLER_ENN_EN_I_UKEN,
  FOR_LANGT_OPPHOLD
}

export default function validerBehandlingsdager(dager: Array<Date>): valideringBehandlingsdager {
  const weeks: Array<number> | undefined = dager?.map((day) => getWeek(day));
  const uniqueWeeks: Array<number> = Array.from(new Set(weeks));

  if (weeks.length !== uniqueWeeks.length) {
    return valideringBehandlingsdager.FLER_ENN_EN_I_UKEN;
  }

  const sortedDays = [...dager].sort();

  for (let i = 0; i < sortedDays.length; i++) {
    if (differenceInCalendarDays(sortedDays[i], sortedDays[i + 1]) > 15) {
      return valideringBehandlingsdager.FOR_LANGT_OPPHOLD;
    }
  }

  return valideringBehandlingsdager.OK;
}
