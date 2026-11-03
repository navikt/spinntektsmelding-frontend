import { z } from 'zod';
import SkjemaInitieringSchema from './SkjemaInitieringSchema';

export const InitieringAnnetSkjemaSchema = SkjemaInitieringSchema.safeExtend({
  sykepengePeriodeId: z.array(z.uuid()).optional(),
  forespurtSykepengePeriodeId: z.uuid().or(z.literal('andrePerioder')).optional(),
  endreRefusjon: z.enum(['Ja', 'Nei', '']).optional()
}).superRefine((data, ctx) => {
  if (!data.forespurtSykepengePeriodeId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Du må velge hva du vil gjøre videre',
      path: ['forespurtSykepengePeriodeId']
    });
  }
  if (data.forespurtSykepengePeriodeId === 'andrePerioder' && !data.sykepengePeriodeId?.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Du må velge minst én periode du vil sende inntektsmelding for',
      path: ['sykepengePeriodeId']
    });
  }
  if (data.endreRefusjon === '') {
    ctx.addIssue({
      code: 'custom',
      message: 'Du må svare på dette spørsmålet',
      path: ['endreRefusjon']
    });
  }
});

export const InitieringFritattSkjemaSchema = InitieringAnnetSkjemaSchema.safeExtend({
  forespurtSykepengePeriodeId: z
    .uuid()
    .or(z.enum(['andrePerioder', 'utenKobling']))
    .optional()
});

export type InitieringAnnetSkjema = z.infer<typeof InitieringAnnetSkjemaSchema>;
export type InitieringFritattSkjema = z.infer<typeof InitieringFritattSkjemaSchema>;
export type PeriodevalgSkjema = Pick<
  InitieringAnnetSkjema,
  'forespurtSykepengePeriodeId' | 'sykepengePeriodeId' | 'endreRefusjon'
>;
