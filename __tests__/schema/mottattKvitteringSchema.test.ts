import {
  KvitteringNavNoInitSchema,
  KvitteringNavNoSchema,
  MottattKvitteringSchema
} from '../../schema/MottattKvitteringSchema';
import { expect } from 'vitest';

import kvittering from '../../mockdata/kvittering-eksternt-system.json';
import agiKvittering from '../../mockdata/kvittering-selvbestemt-format.json';

describe('MottattKvitteringSchema', () => {
  it.each([{ navn: undefined }, { navn: '' }, { orgNavn: '' }])(
    'accepts incomplete display names only for initialization: %j',
    (navn) => {
      const avsender = { ...agiKvittering.selvbestemtInntektsmelding.avsender, ...navn };

      expect(KvitteringNavNoInitSchema.shape.avsender.parse(avsender)).toEqual(avsender);
      expect(KvitteringNavNoSchema.shape.avsender.safeParse(avsender).success).toBe(false);
    }
  );

  it.each([{ orgnr: 'ugyldig' }, { tlf: 'ugyldig' }])('rejects invalid initialization identifiers: %j', (felt) => {
    const avsender = { ...agiKvittering.selvbestemtInntektsmelding.avsender, navn: undefined, ...felt };

    expect(KvitteringNavNoInitSchema.shape.avsender.safeParse(avsender).success).toBe(false);
  });

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
