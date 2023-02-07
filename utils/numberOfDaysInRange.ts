import { differenceInDays } from 'date-fns';

export default function numberOfDaysInRange(start: Date, end: Date): number {
  const daysBetween = differenceInDays(end, start);
  return daysBetween + 1;
}
