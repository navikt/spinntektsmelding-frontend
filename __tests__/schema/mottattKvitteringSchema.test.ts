import { MottattKvitteringSchema } from '../../schema/MottattKvitteringSchema';

import { z } from 'zod';

import kvittering from '../../mockdata/kvittering-data.json';

describe('MottattKvitteringSchema', () => {
  it('should validate MottattKvitteringSchema', () => {
    expect(MottattKvitteringSchema.safeParse(kvittering).success).toBe(true);
  });

  it('should validate MottattKvitteringSchema with error on fnr', () => {
    const data = {
      ...kvittering
    };
    data.kvitteringDokument.identitetsnummer = '12345678901';

    const result = MottattKvitteringSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toEqual(
      JSON.stringify(
        new z.ZodError([
          {
            code: 'custom',
            message: 'Ugyldig personnummer',
            path: ['kvitteringDokument', 'identitetsnummer']
          }
        ])
      )
    );
  });
});
