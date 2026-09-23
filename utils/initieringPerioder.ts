import formatDate from './formatDate';
import parseIsoDate from './parseIsoDate';
import type { SoeknadArbeidstaker } from '../schema/EndepunktSykepengesoeknaderSchema';

export type Periode = {
  fom: string | Date;
  tom: string | Date;
};

export function formaterEgenmeldingsdager(egenmeldingsdager: Periode[] | null | undefined) {
  if (!egenmeldingsdager || egenmeldingsdager.length === 0) {
    return null;
  }

  return 'Egenmeldingsperiode: ' + egenmeldingsdager.map((periode) => formaterPerioder(periode)).join(', ');
}

function visDato(id: string, perioder: SoeknadArbeidstaker[], key: 'fom' | 'tom'): string {
  const periode = perioder.find((p) => p.vedtaksperiodeId === id);
  return periode ? formatDate(parseIsoDate(periode.sykmeldingsperiode[key])) : '';
}

export const visFomDato = (id: string, perioder: SoeknadArbeidstaker[]) => visDato(id, perioder, 'fom');
export const visTomDato = (id: string, perioder: SoeknadArbeidstaker[]) => visDato(id, perioder, 'tom');

export function getFravaersperioder<T extends Periode>(perioder: T[]) {
  return perioder.map((periode) => ({ fom: periode.fom, tom: periode.tom }));
}

function formaterPerioder(periode: Periode) {
  return `${formatDate(parseIsoDate(periode.fom))} - ${formatDate(parseIsoDate(periode.tom))}`;
}
