import { describe, expect, it } from 'vitest';
import { InitieringAnnetSkjemaSchema, InitieringFritattSkjemaSchema } from '../../schema/InitieringPeriodevalgSchema';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';

const organisasjonsnummer = testOrganisasjoner[0].organizationNumber;
const periodeId = '123e4567-e89b-12d3-a456-426614174000';

describe.each([
  ['Annet', InitieringAnnetSkjemaSchema],
  ['Fritatt', InitieringFritattSkjemaSchema]
])('Initiering %s', (_navn, schema) => {
  it('requires a choice for how to proceed', () => {
    const result = schema.safeParse({ organisasjonsnummer });

    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['forespurtSykepengePeriodeId'],
        message: 'Du må velge hva du vil gjøre videre'
      })
    );
  });

  it.each([{ perioder: undefined }, { perioder: [] }])(
    'requires at least one period for andrePerioder with $perioder',
    ({ perioder }) => {
      const result = schema.safeParse({
        organisasjonsnummer,
        forespurtSykepengePeriodeId: 'andrePerioder',
        sykepengePeriodeId: perioder
      });

      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['sykepengePeriodeId'],
          message: 'Du må velge minst én periode du vil sende inntektsmelding for'
        })
      );
    }
  );

  it('accepts andrePerioder with a selected period', () => {
    expect(
      schema.safeParse({
        organisasjonsnummer,
        forespurtSykepengePeriodeId: 'andrePerioder',
        sykepengePeriodeId: [periodeId]
      }).success
    ).toBe(true);
  });

  it('accepts an existing request without selecting additional periods', () => {
    expect(schema.safeParse({ organisasjonsnummer, forespurtSykepengePeriodeId: periodeId }).success).toBe(true);
  });

  it.each([
    ['', 'Du må svare på dette spørsmålet'],
    ['Ja', 'Endring av refusjon for den ansatte må gjøres i den opprinnelige inntektsmeldingen.'],
    ['Nei', 'Du kan ikke sende inn en inntektsmelding som forlengelse av en tidligere inntektsmelding.']
  ])('preserves the blocking refund rule for %j', (endreRefusjon, message) => {
    const result = schema.safeParse({
      organisasjonsnummer,
      forespurtSykepengePeriodeId: periodeId,
      endreRefusjon
    });

    expect(result.error?.issues).toContainEqual(expect.objectContaining({ path: ['endreRefusjon'], message }));
  });

  it('preserves organisation number validation', () => {
    const result = schema.safeParse({ organisasjonsnummer: '123', forespurtSykepengePeriodeId: periodeId });

    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({ path: ['organisasjonsnummer'], message: 'Organisasjon er ikke valgt.' })
    );
  });
});

it('only allows utenKobling for Fritatt', () => {
  const data = { organisasjonsnummer, forespurtSykepengePeriodeId: 'utenKobling' };

  expect(InitieringAnnetSkjemaSchema.safeParse(data).success).toBe(false);
  expect(InitieringFritattSkjemaSchema.safeParse(data).success).toBe(true);
});
