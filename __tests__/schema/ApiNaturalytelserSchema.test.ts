import { describe, it, expect } from 'vitest';
import { NaturalytelseEnumSchema } from '../../schema/NaturalytelseEnumSchema';
import { ApiNaturalytelserSchema } from '../../schema/ApiNaturalytelserSchema';
// import { ApiNaturalytelserSchema } from './ApiNaturalytelserSchema';
// import { NaturalytelseEnumSchema } from './NaturalytelseEnumSchema';

function getFirstEnumValue(): string {
  const def: any = NaturalytelseEnumSchema as any;
  return def?.options?.[0] ?? def?._def?.values?.[0] ?? 'DUMMY_ENUM_VALUE';
}

const validNaturalytelse = getFirstEnumValue();
const validDate = '2024-01-01';

describe('ApiNaturalytelserSchema', () => {
  it('parses a valid array with one item', () => {
    const input = [
      {
        naturalytelse: validNaturalytelse,
        verdiBeloep: 100,
        sluttdato: validDate
      }
    ];
    const result = ApiNaturalytelserSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('parses an empty array', () => {
    const input: any[] = [];
    const result = ApiNaturalytelserSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('fails when verdiBeloep is negative', () => {
    const input = [
      {
        naturalytelse: validNaturalytelse,
        verdiBeloep: -1,
        sluttdato: validDate
      }
    ];
    const result = ApiNaturalytelserSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === '0.verdiBeloep');
      expect(issue).toBeTruthy();
      expect(issue?.message.toLowerCase()).toContain('too small: expected number to be >=0');
    }
  });

  it('fails with custom message when sluttdato is missing', () => {
    const input = [
      {
        naturalytelse: validNaturalytelse,
        verdiBeloep: 10
        // sluttdato omitted
      } as any
    ];
    const result = ApiNaturalytelserSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual([
        {
          code: 'invalid_union',
          errors: [
            [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Sluttdato mangler',
                path: [0, 'sluttdato']
              }
            ],
            [
              {
                code: 'too_big',
                maximum: 0,
                message: 'Too big: expected array to have <0 items',
                origin: 'array',
                path: []
              }
            ]
          ],
          message: 'Invalid input',
          path: []
        }
      ]); // For debugging
      //   const issue = result.error.issues.find((i) => i.path.join('.') === '0.sluttdato');
      //   expect(issue?.message).toBe('Sluttdato mangler');
      // }
    }
  });

  it('fails with custom message when sluttdato is invalid format', () => {
    const input = [
      {
        naturalytelse: validNaturalytelse,
        verdiBeloep: 10,
        sluttdato: 'not-a-date'
      }
    ];
    const result = ApiNaturalytelserSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === '0.sluttdato');
      expect(issue?.message).toBe('Ugyldig sluttdato');
    }
  });

  it('fails when naturalytelse is not in enum', () => {
    const invalidValue = validNaturalytelse + '_INVALID';
    const input = [
      {
        naturalytelse: invalidValue,
        verdiBeloep: 10,
        sluttdato: validDate
      }
    ];
    const result = ApiNaturalytelserSchema.safeParse(input);
    expect(result.success).toBe(false);

    // result.error.message.find((msg) => msg.includes('Invalid enum value'));
    expect(result.error?.issues).toEqual([
      {
        code: 'invalid_union',
        errors: [
          [
            {
              code: 'invalid_value',
              values: [
                'AKSJERGRUNNFONDSBEVISTILUNDERKURS',
                'ANNET',
                'BEDRIFTSBARNEHAGEPLASS',
                'BESOEKSREISERHJEMMETANNET',
                'BIL',
                'BOLIG',
                'ELEKTRONISKKOMMUNIKASJON',
                'FRITRANSPORT',
                'INNBETALINGTILUTENLANDSKPENSJONSORDNING',
                'KOSTBESPARELSEIHJEMMET',
                'KOSTDAGER',
                'KOSTDOEGN',
                'LOSJI',
                'OPSJONER',
                'RENTEFORDELLAAN',
                'SKATTEPLIKTIGDELFORSIKRINGER',
                'TILSKUDDBARNEHAGEPLASS',
                'YRKEBILTJENESTLIGBEHOVKILOMETER',
                'YRKEBILTJENESTLIGBEHOVLISTEPRIS'
              ],
              path: [0, 'naturalytelse'],
              message: 'Vennligst velg ytelse.'
            }
          ],
          [
            {
              code: 'too_big',
              maximum: 0,
              origin: 'array',
              path: [],
              message: 'Too big: expected array to have <0 items'
            }
          ]
        ],
        path: [],
        message: 'Invalid input'
      }
    ]);
  });
});
