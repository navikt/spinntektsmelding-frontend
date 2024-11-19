import mottattKvitteringSchema from '../../schema/mottattKvitteringSchema';

import { z } from 'zod';

import kvittering from '../../mockdata/kvittering-data.json';

describe('mottattKvitteringSchema', () => {
  it('should validate mottattKvitteringSchema', () => {
    expect(mottattKvitteringSchema.safeParse(kvittering).success).toBe(true);
  });

  it('should validate mottattKvitteringSchema with error on fnr', () => {
    const data = {
      ...kvittering
    };
    data.kvitteringDokument.identitetsnummer = '12345678901';

    expect(mottattKvitteringSchema.safeParse(data).success).toBe(false);
    expect(mottattKvitteringSchema.safeParse(data).error).toEqual(
      new z.ZodError([
        {
          code: 'custom',
          message: 'Ugyldig personnummer',
          path: ['kvitteringDokument', 'identitetsnummer']
        }
      ])
    );
  });
});
