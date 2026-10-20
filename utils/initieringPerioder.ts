import formatDate from './formatDate';
import parseIsoDate from './parseIsoDate';
import type { SoeknadArbeidstaker } from '../schema/EndepunktSykepengesoeknaderSchema';
import formatIsoDate from './formatIsoDate';
import { ApiPeriode, ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';

export type Periode = {
  fom: string | Date;
  tom: string | Date;
};

export function formaterEgenmeldingsdager(egenmeldingsdager: Periode[] | null | undefined) {
  if (!egenmeldingsdager || egenmeldingsdager.length === 0) {
    return null;
  }

  return 'Egenmeldingsperiode: ' + egenmeldingsdager.map((periode) => formaterPeriode(periode)).join(', ');
}

function visDato(id: string, perioder: SoeknadArbeidstaker[], key: 'fom' | 'tom'): string {
  const periode = perioder.find((p) => p.vedtaksperiodeId === id);
  return periode ? formatDate(parseIsoDate(periode.sykmeldingsperiode[key])) : '';
}

export const visFomDato = (id: string, perioder: SoeknadArbeidstaker[]) => visDato(id, perioder, 'fom');
export const visTomDato = (id: string, perioder: SoeknadArbeidstaker[]) => visDato(id, perioder, 'tom');

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
