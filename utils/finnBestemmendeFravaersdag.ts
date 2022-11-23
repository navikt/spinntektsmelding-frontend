import { differenceInBusinessDays, formatISO9075, parseISO } from 'date-fns';
import { MottattPeriode } from '../state/MottattData';
import { Periode } from '../state/state';

export interface FravaersPeriode {
  fom: Date;
  tom: Date;
}

const overlappendePeriode = (ene: FravaersPeriode, andre: FravaersPeriode) => {
  if (ene.tom < andre.fom || ene.fom > andre.tom) {
    return null;
  }

  const obj: FravaersPeriode = {
    fom: ene.fom > andre.fom ? andre.fom : ene.fom,
    tom: ene.tom > andre.tom ? ene.tom : andre.tom
  };

  return obj;
};

const tilstoetendePeriode = (ene: FravaersPeriode, andre: FravaersPeriode) => {
  if (ene.tom === andre.tom && ene.fom === andre.fom) {
    return ene;
  }

  console.log('diff i dager', differenceInBusinessDays(andre.fom, ene.tom));

  if (differenceInBusinessDays(andre.fom, ene.tom) <= 1) {
    const obj: FravaersPeriode = {
      fom: ene.fom,
      tom: andre.tom
    };
    console.log('stuff', {
      fom: ene.fom,
      tom: andre.tom
    });
    return obj;
  }

  return null;
};

const finnBestemmendeFravaersdag = (fravaersperioder: Array<MottattPeriode> | Array<Periode>): string | undefined => {
  if (!fravaersperioder) {
    return undefined;
  }

  const aktivePerioder = fravaersperioder
    .map((fravaer) => ({ fom: fravaer.fom, tom: fravaer.tom }))
    .map((element) => JSON.stringify(element));

  const unikeSykmeldingsperioder: Array<FravaersPeriode> = [...new Set([...aktivePerioder])]
    .map((periode) => JSON.parse(periode))
    .map((periode) => ({
      fom: parseISO(periode.fom),
      tom: parseISO(periode.tom)
    }));

  const sorterteSykemeldingsperioder = [...unikeSykmeldingsperioder].sort((a, b) => {
    if (a.fom > b.fom) return 1;
    return -1;
  });

  const mergedSykemeldingsperioder = [sorterteSykemeldingsperioder[0]];

  sorterteSykemeldingsperioder.forEach((periode) => {
    const aktivPeriode = mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1];
    const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      mergedSykemeldingsperioder.push(periode);
    }
  });

  const tilstotendeSykemeldingsperioder = [mergedSykemeldingsperioder[0]];
  mergedSykemeldingsperioder.forEach((periode) => {
    const aktivPeriode = tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1];
    const oppdatertPeriode = tilstoetendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      tilstotendeSykemeldingsperioder.push(periode);
    }
  });

  console.log('tilstotendeSykemeldingsperioder', tilstotendeSykemeldingsperioder);

  return formatISO9075(tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom, {
    representation: 'date'
  });
};

export default finnBestemmendeFravaersdag;
