import z from 'zod';
import { isoDate } from './EndepunktSykepengesoeknaderSchema';

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

export const SPEndepunktSykepengesoeknadSchema = z.object({
  sykepengesoknadUuid: z.uuid(),
  fom: isoDate,
  tom: isoDate,
  sykmeldingId: z.uuid(),
  status: soeknadStatus,
  startSykeforlop: isoDate,
  egenmeldingsdagerFraSykmelding: z.array(isoDate),
  vedtaksperiodeId: z.uuid().nullable(),
  forespoerselId: z.uuid().optional(),
  soknadstype: z.string().optional(),
  behandlingsdager: z.array(isoDate).optional(),
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
