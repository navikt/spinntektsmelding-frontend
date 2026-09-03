import { z } from 'zod';

const isoDate = z.iso.date();

const ForespoerselResponseSchema = z.object({
  forespoerselId: z.uuid(),
  sykmeldingsperioder: z.array(
    z.object({
      fom: isoDate,
      tom: isoDate
    })
  ),
  egenmeldingsperioder: z.array(
    z.object({
      fom: isoDate,
      tom: isoDate
    })
  ),
  erBesvart: z.boolean()
});

const SoeknadArbeidstakerResponseSchema = z.object({
  sykmeldingsperiode: z.object({
    fom: isoDate,
    tom: isoDate
  }),
  egenmeldingsperioder: z.array(
    z.object({
      fom: isoDate,
      tom: isoDate
    })
  ),
  erGradert: z.boolean()
});

const SoeknadBehandlingsdagerResponseSchema = z.object({
  sykmeldingsperiode: z.object({
    fom: isoDate,
    tom: isoDate
  }),
  behandlingsdager: z.array(isoDate)
});

export const EndepunktSykepengesoeknaderSchema = z.object({
  forespoersler: z.array(ForespoerselResponseSchema),
  soeknaderArbeidstaker: z.array(SoeknadArbeidstakerResponseSchema),
  soeknaderBehandlingsdager: z.array(SoeknadBehandlingsdagerResponseSchema)
});

export type EndepunktSykepengesoeknader = z.infer<typeof EndepunktSykepengesoeknaderSchema>;
