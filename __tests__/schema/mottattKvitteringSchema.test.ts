import {
  KvitteringNavNoInitSchema,
  KvitteringNavNoSchema,
  MottattKvitteringSchema
} from '../../schema/MottattKvitteringSchema';
import { expect } from 'vitest';

import kvittering from '../../mockdata/kvittering-eksternt-system.json';
import agiKvittering from '../../mockdata/kvittering-selvbestemt-format.json';
import delvisKvittering from '../../mockdata/kvittering-delvis.json';

describe('MottattKvitteringSchema', () => {
  it.each([
    null,
    {
      harLikLoenn: false,
      erSykmeldtFraAlle: false,
      arbeidsforhold: [
        { inkludertISykefravaer: true, yrkesbeskrivelse: 'Utvikler', stillingsprosent: 50, inntekt: 20000 },
        { inkludertISykefravaer: false, yrkesbeskrivelse: 'Laerer', stillingsprosent: 50, inntekt: 30000 }
      ]
    }
  ])('preserves receipt metadata and multiple employment relationships: %j', (flereArbeidsforhold) => {
    const kvitteringNavNo = delvisKvittering.kvitteringNavNo;
    const skjema = { ...kvitteringNavNo.skjema, flereArbeidsforhold };
    const data = MottattKvitteringSchema.parse({
      kvitteringNavNo: { ...kvitteringNavNo, skjema }
    });

    expect(data.kvitteringNavNo?.skjema).toMatchObject({
      forespoerselId: skjema.forespoerselId,
      avsenderTlf: skjema.avsenderTlf,
      flereArbeidsforhold
    });
  });

  it('defaults missing employment relationships to null for older receipts', () => {
    const data = MottattKvitteringSchema.parse(delvisKvittering);

    expect(data.kvitteringNavNo?.skjema.flereArbeidsforhold).toBeNull();
  });

  it.each([
    { forespoerselId: undefined },
    { forespoerselId: 'ugyldig' },
    { avsenderTlf: undefined },
    { avsenderTlf: 'ugyldig' },
    {
      flereArbeidsforhold: {
        harLikLoenn: false,
        erSykmeldtFraAlle: false,
        arbeidsforhold: [{ yrkesbeskrivelse: 'Utvikler', stillingsprosent: 50, inntekt: 20000 }]
      }
    }
  ])('rejects invalid or incomplete receipt metadata: %j', (felt) => {
    const kvitteringNavNo = delvisKvittering.kvitteringNavNo;
    const data = {
      kvitteringNavNo: {
        ...kvitteringNavNo,
        skjema: { ...kvitteringNavNo.skjema, ...felt }
      }
    };

    expect(MottattKvitteringSchema.safeParse(data).success).toBe(false);
  });

  it('accepts and preserves null income in a received receipt', () => {
    const kvitteringNavNo = delvisKvittering.kvitteringNavNo;
    const data = {
      kvitteringNavNo: {
        ...kvitteringNavNo,
        skjema: { ...kvitteringNavNo.skjema, inntekt: null }
      }
    };

    expect(MottattKvitteringSchema.parse(data).kvitteringNavNo?.skjema.inntekt).toBeNull();
  });

  it.each([undefined, { beloep: 65000 }])('rejects missing or incomplete income: %j', (inntekt) => {
    const kvitteringNavNo = delvisKvittering.kvitteringNavNo;
    const data = {
      kvitteringNavNo: {
        ...kvitteringNavNo,
        skjema: { ...kvitteringNavNo.skjema, inntekt }
      }
    };

    expect(MottattKvitteringSchema.safeParse(data).success).toBe(false);
  });

  it('accepts a receipt with only periods and reduced salary in agp', () => {
    const kvitteringNavNo = delvisKvittering.kvitteringNavNo;
    const data = {
      kvitteringNavNo: {
        ...kvitteringNavNo,
        skjema: {
          ...kvitteringNavNo.skjema,
          agp: {
            perioder: [{ fom: '2025-05-01', tom: '2025-05-16' }],
            redusertLoennIAgp: null
          }
        }
      }
    };

    expect(MottattKvitteringSchema.parse(data).kvitteringNavNo?.skjema.agp).toEqual(data.kvitteringNavNo.skjema.agp);
  });

  it('accepts a partial receipt with null change reasons, null refund amount and missing natural benefits', () => {
    const data = MottattKvitteringSchema.parse(delvisKvittering);

    expect(data.kvitteringNavNo?.skjema).toMatchObject({
      inntekt: { endringAarsak: null, endringAarsaker: null },
      refusjon: { beloepPerMaaned: null }
    });
  });

  it.each([null, undefined])('accepts absent change reasons and natural benefits represented by %s', (value) => {
    const kvitteringNavNo = delvisKvittering.kvitteringNavNo;
    const data = {
      kvitteringNavNo: {
        ...kvitteringNavNo,
        skjema: {
          ...kvitteringNavNo.skjema,
          inntekt: {
            ...kvitteringNavNo.skjema.inntekt,
            endringAarsak: value,
            endringAarsaker: value,
            naturalytelser: value
          },
          naturalytelser: value
        }
      }
    };

    expect(MottattKvitteringSchema.safeParse(data).success).toBe(true);
  });

  it('still rejects invalid values in optional receipt fields', () => {
    const skjema = KvitteringNavNoSchema.shape.skjema;
    const inntekt = skjema.shape.inntekt.unwrap();

    expect(inntekt.shape.endringAarsak.safeParse('Bonus').success).toBe(false);
    expect(inntekt.shape.endringAarsaker.safeParse(['Bonus']).success).toBe(false);
    expect(skjema.shape.naturalytelser.safeParse('ugyldig').success).toBe(false);
    expect(inntekt.shape.naturalytelser.safeParse('ugyldig').success).toBe(false);
    expect(skjema.shape.refusjon.safeParse({ beloepPerMaaned: '0', endringer: [] }).success).toBe(false);
  });

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
      kvitteringNavNo: null,
      visGeneriskKvittering: true
    };
    expect(MottattKvitteringSchema.safeParse(data).success).toBe(true);
  });

  it('accepts a generic receipt with an explicitly null kvitteringNavNo', () => {
    expect(MottattKvitteringSchema.parse(kvittering)).toEqual({
      kvitteringNavNo: null,
      visGeneriskKvittering: true
    });
  });

  it('rejects a generic receipt without kvitteringNavNo', () => {
    expect(MottattKvitteringSchema.safeParse({ visGeneriskKvittering: true }).success).toBe(false);
  });

  it.each([true, false])(
    'discards the legacy object without changing visGeneriskKvittering=%s',
    (visGeneriskKvittering) => {
      const data = { kvitteringNavNo: null, visGeneriskKvittering };
      const kvitteringEkstern = { avsenderSystem: 123, referanse: null, mottatt: 'ugyldig' };

      expect(MottattKvitteringSchema.parse({ ...data, kvitteringEkstern })).toEqual(data);
    }
  );
});
