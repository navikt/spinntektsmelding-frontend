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

const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/;

export const endepunktSykepengesoeknaderSchema = z
  .array(
    z.object({
      sykepengesoknadUuid: z.string().uuid(),
      fom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
      tom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
      sykmeldingId: z.string().uuid(),
      status: soeknadStatus,
      startSykeforlop: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
      egenmeldingsdagerFraSykmelding: z
        .array(z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'))
        .or(z.tuple([])),
      vedtaksperiodeId: z.string().uuid().nullable(),
      forespoerselId: z.string().uuid().optional()
    })
  )
  .or(z.tuple([]));
