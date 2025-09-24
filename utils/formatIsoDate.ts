import formatISO from 'date-fns/formatISO';
import { isValid } from 'date-fns';
import { TDateISODate } from '../schema/ForespurtDataSchema';

export default function formatIsoDate(date?: Date): TDateISODate | '' {
  if (!date) {
    return '';
  }

  if (!isValid(date)) {
    return '';
  }

  return formatISO(date, { representation: 'date' }) as TDateISODate;
}
