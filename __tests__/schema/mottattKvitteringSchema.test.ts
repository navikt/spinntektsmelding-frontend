import { KvitteringNavNoSchema, MottattKvitteringSchema } from '../../schema/MottattKvitteringSchema';
import { expect } from 'vitest';

import kvittering from '../../mockdata/kvittering-eksternt-system.json';

describe('MottattKvitteringSchema', () => {
  it('should preserve the received datetime and timezone', () => {
    const schema = KvitteringNavNoSchema.pick({ mottatt: true });
    const data = { mottatt: '2026-10-23T13:30:00+02:00' };

    expect(schema.parse(data)).toEqual(data);
    expect(schema.safeParse({ mottatt: '2026-10-23' }).success).toBe(false);
  });

  it('should validate MottattKvitteringSchema', () => {
    const data = {
      kvitteringEkstern: kvittering.kvitteringEkstern,
      kvitteringNavNo: null
    };
    expect(MottattKvitteringSchema.safeParse(data).success).toBe(true);
  });

  it('should reject an invalid external receipt timestamp', () => {
    const data = {
      kvitteringEkstern: { ...kvittering.kvitteringEkstern, mottatt: 'ugyldig' },
      kvitteringNavNo: null
    };

    const result = MottattKvitteringSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['kvitteringEkstern', 'mottatt']);
  });
});
