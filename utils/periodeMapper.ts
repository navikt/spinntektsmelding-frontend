import { nanoid } from 'nanoid';
import { Periode } from '../state/state';
import formatIsoDate from './formatIsoDate';
import parseIsoDate from './parseIsoDate';

const blankPeriode: Periode[] = [{ fom: undefined, tom: undefined, id: nanoid() }];

export function periodeMapper(perioder: { fom: Date; tom: Date }[] | { fom: string; tom: string }[]): Periode[] {
  if (!perioder || perioder.length == 0) return blankPeriode;
  return perioder.map((periode) => {
    const fomId = periode.fom ? isoDate(periode.fom) : nanoid();
    const tomId = periode.tom ? isoDate(periode.tom) : 'undefined';

    return {
      fom: typeof periode.fom === 'string' ? parseIsoDate(periode.fom) : periode.fom,
      tom: typeof periode.tom === 'string' ? parseIsoDate(periode.tom) : periode.tom,
      id: fomId + '-' + tomId
    };
  });
}

function isoDate(date: Date | string): string {
  if (typeof date !== 'string') {
    return formatIsoDate(date);
  }
  return date;
}
