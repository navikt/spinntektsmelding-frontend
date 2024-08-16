import { z } from 'zod';

const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/;

export const endepunktSykepengesoeknaderSchema = z.array(
  z.object({
    sykepengesoknadUuid: z.string().uuid(),
    fom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
    tom: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
    sykmeldingId: z.string().uuid(),
    status: z.string(),
    startSykeforlop: z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'),
    egenmeldingsdagerFraSykmelding: z
      .array(z.string().regex(ISO_DATE_REGEX, 'Dato er ikke i ISO-format'))
      .or(z.tuple([])),
    vedtaksperiodeId: z.string().uuid().nullable()
  })
);
