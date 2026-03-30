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

const isoDate = z.iso.date();

export const EndepunktSykepengesoeknadSchema = z.object({
  sykepengesoknadUuid: z.uuid(),
  fom: isoDate,
  tom: isoDate,
  sykmeldingId: z.uuid(),
  status: soeknadStatus,
  startSykeforlop: isoDate,
  egenmeldingsdagerFraSykmelding: z.array(isoDate).or(z.tuple([])),
  vedtaksperiodeId: z.uuid().nullable(),
  forespoerselId: z.uuid().optional(),
  soknadstype: z.string().optional(),
  behandlingsdager: z.array(isoDate).or(z.tuple([])).optional(),
  soknadsperioder: z
    .array(
      z.object({
        fom: isoDate,
        tom: isoDate,
        grad: z.number().min(0).max(100),
        faktiskGrad: z.number().min(0).max(100).nullish()
      })
    )
    .optional()
});

export const EndepunktSykepengesoeknaderSchema = z.array(EndepunktSykepengesoeknadSchema).or(z.tuple([]));
