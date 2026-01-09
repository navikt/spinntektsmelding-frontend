import { formatISO, isValid } from 'date-fns';
import { TDateISODate } from '../schema/ForespurtDataSchema';

export default function formatIsoDate(date?: Date): TDateISODate | undefined {
  if (!date) {
    return undefined;
  }

  if (!isValid(date)) {
    return undefined;
  }

  return formatISO(date, { representation: 'date' });
}
