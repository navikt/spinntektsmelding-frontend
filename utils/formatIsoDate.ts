import formatISO from 'date-fns/formatISO';

export default function formatIsoDate(date?: Date): string {
  if (!date) {
    return '';
  }

  if (typeof date !== Date) {
    return '';
  }

  return formatISO(date, { representation: 'date' });
}
