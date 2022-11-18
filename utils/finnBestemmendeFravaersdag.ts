import { differenceInBusinessDays, formatISO9075, parseISO } from 'date-fns';
import { MottattPeriode, MottattArbeidsforhold } from '../state/MottattData';

export interface FravaersPeriode {
  fra: Date;
  til: Date;
}

const overlappendePeriode = (ene: FravaersPeriode, andre: FravaersPeriode) => {
  if (ene.til < andre.fra || ene.fra > andre.til) {
    return null;
  }

  const obj: FravaersPeriode = {
    fra: ene.fra > andre.fra ? andre.fra : ene.fra,
    til: ene.til > andre.til ? ene.til : andre.til
  };

  return obj;
};

const tilstoetendePeriode = (ene: FravaersPeriode, andre: FravaersPeriode) => {
  if (ene.til === andre.til && ene.fra === andre.fra) {
    return ene;
  }

  console.log('diff i dager', differenceInBusinessDays(andre.fra, ene.til));

  if (differenceInBusinessDays(andre.fra, ene.til) <= 1) {
    const obj: FravaersPeriode = {
      fra: ene.fra,
      til: andre.til
    };
    return obj;
  }

  return null;
};

const finnBestemmendeFravaersdag = (
  fravaersperiode: { [key: string]: Array<MottattPeriode> },
  arbeidsforhold: Array<MottattArbeidsforhold>
): string | undefined => {
  if (!fravaersperiode) {
    return undefined;
  }

  const aktiveArbeidsforholdId = arbeidsforhold.map((forhold) => forhold.arbeidsforholdId);

  const aktivePerioder = aktiveArbeidsforholdId
    .flatMap((arbeidsforholdId) =>
      fravaersperiode[arbeidsforholdId].map((fravaer) => ({ fra: fravaer.fra, til: fravaer.til }))
    )
    .map((element: MottattPeriode) => JSON.stringify(element));

  const unikeSykmeldingsperioder: Array<FravaersPeriode> = [...new Set([...aktivePerioder])]
    .map((periode) => JSON.parse(periode))
    .map((periode) => ({
      fra: parseISO(periode.fra),
      til: parseISO(periode.til)
    }));

  const sorterteSykemeldingsperioder = [...unikeSykmeldingsperioder].sort((a, b) => {
    if (a.fra > b.fra) return 1;
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

  console.log(sorterteSykemeldingsperioder);
  console.log(tilstotendeSykemeldingsperioder);

  return formatISO9075(mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1].fra, {
    representation: 'date'
  });
};

export default finnBestemmendeFravaersdag;
