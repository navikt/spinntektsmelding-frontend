import { parse } from 'date-fns';

export default function parseIsoDate(isoDateString: string): Date {
  return parse(isoDateString, 'yyyy-MM-dd', new Date());
}
