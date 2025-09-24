import { z } from 'zod';

const soeknadStatus = z.enum([
  'NY',
  'SENDT',
  'FREMTIDIG',
  'UTKAST_TIL_KORRIGERING',
  'KORRIGERT',
  'AVBRUTT',
  'UTGATT',
  'SLETTET'
]);

export const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/;

export const EndepunktSykepengesoeknadSchema = z.object({
  sykepengesoknadUuid: z.uuid(),
  fom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
  tom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
  sykmeldingId: z.uuid(),
  status: soeknadStatus,
  startSykeforlop: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
  egenmeldingsdagerFraSykmelding: z
    .array(z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'))
    .or(z.tuple([])),
  vedtaksperiodeId: z.uuid().nullable(),
  forespoerselId: z.uuid().optional(),
  soknadstype: z.string().optional(),
  behandlingsdager: z.array(z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format')).or(z.tuple([])).optional()
});

export const EndepunktSykepengesoeknaderSchema = z.array(EndepunktSykepengesoeknadSchema).or(z.tuple([]));
