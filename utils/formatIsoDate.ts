import formatISO from 'date-fns/formatISO';

export default function formatIsoDate(date?: Date): string {
  if (!date) {
    return '';
  }

  return formatISO(date, { representation: 'date' });
}
