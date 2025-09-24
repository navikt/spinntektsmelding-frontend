import { z } from 'zod/v4';
import { PeriodeListeSchema } from '../../schema/PeriodeListeSchema';
type PeriodeListeSchema = z.infer<typeof PeriodeListeSchema>;

describe('PeriodeListeSchema', () => {
  it('should validate PeriodeListeSchema, 1 periode is OK', () => {
    const data = [{ fom: '2021-01-01', tom: '2021-01-02' }];

    expect(PeriodeListeSchema.safeParse(data).success).toBe(true);
  });

  it('should validate PeriodeListeSchema, empty periode is OK', () => {
    const data: PeriodeListeSchema = [];

    expect(PeriodeListeSchema.safeParse(data).success).toBe(true);
  });

  it('should validate PeriodeListeSchema', () => {
    const data = [
      { fom: '2021-01-01', tom: '2021-01-02' },
      { fom: '2021-01-10', tom: '2021-01-12' }
    ];

    expect(PeriodeListeSchema.safeParse(data).success).toBe(true);
  });

  it('should not validate PeriodeListeSchema with big gap', () => {
    const data = [
      { fom: '2021-01-01', tom: '2021-01-11' },
      { fom: '2021-02-01', tom: '2021-02-11' }
    ];

    expect(PeriodeListeSchema.safeParse(data).success).toBeFalsy();
  });

  it('should invalidate PeriodeListeSchema', () => {
    const data = '12345678';

    expect(PeriodeListeSchema.safeParse(data).success).toBe(false);
  });
});
