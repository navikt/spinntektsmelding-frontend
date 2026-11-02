import formatDate from './formatDate';
import parseIsoDate from './parseIsoDate';
import type { Forespoersel } from '../schema/EndepunktSykepengesoeknaderSchema';
import formatIsoDate from './formatIsoDate';
import { ApiPeriode, ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';

export type Periode = {
  fom: string | Date;
  tom: string | Date;
};

export function finnForespoerselId(forespoersler: Forespoersel[], vedtaksperiodeId: string) {
  const forespoersel = forespoersler.find((forespoersel) => forespoersel.vedtaksperiodeId === vedtaksperiodeId);
  return forespoersel ? forespoersel.forespoerselId : null;
}

export function formaterEgenmeldingsdager(egenmeldingsdager: Periode[] | null | undefined) {
  if (!egenmeldingsdager || egenmeldingsdager.length === 0) {
    return null;
  }

  return 'Egenmeldingsperiode: ' + egenmeldingsdager.map((periode) => formaterPeriode(periode)).join(', ');
}

export function getFravaersperioder(perioder: readonly Periode[]): ApiPeriode[] {
  const fravaersperioder = perioder.map((periode) => ({
    fom: formatIsoDate(parseIsoDate(periode.fom)),
    tom: formatIsoDate(parseIsoDate(periode.tom))
  }));

  return ApiPeriodeSchema.array().parse(fravaersperioder);
}

function formaterPeriode(periode: Periode) {
  return `${formatDate(parseIsoDate(periode.fom))} - ${formatDate(parseIsoDate(periode.tom))}`;
}
