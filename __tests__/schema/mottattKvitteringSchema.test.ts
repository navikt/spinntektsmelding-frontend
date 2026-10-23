import { MottattKvitteringSchema } from '../../schema/MottattKvitteringSchema';
import { expect } from 'vitest';

import kvittering from '../../mockdata/kvittering-eksternt-system.json';

describe('MottattKvitteringSchema', () => {
  it('should validate MottattKvitteringSchema', () => {
    const data = {
      kvitteringEkstern: kvittering.kvitteringEkstern,
      kvitteringNavNo: null
    };
    expect(MottattKvitteringSchema.safeParse(data).success).toBe(true);
  });

  it('should reject an invalid external receipt timestamp', () => {
    const data = {
      kvitteringEkstern: { ...kvittering.kvitteringEkstern, tidspunkt: 'ugyldig' },
      kvitteringNavNo: null
    };

    const result = MottattKvitteringSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['kvitteringEkstern', 'tidspunkt']);
  });
});
