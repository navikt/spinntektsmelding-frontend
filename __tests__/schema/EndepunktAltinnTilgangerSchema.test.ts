import { describe, it, expect } from 'vitest';
import { EndepunktAltinnTilgangerSchema } from '../../schema/EndepunktAltinnTilgangerSchema';

describe('EndepunktAltinnTilgangerSchema', () => {
  const validData = {
    hierarki: [
      {
        orgnr: '1',
        erSlettet: false,
        altinn3Tilganger: ['A'],
        altinn2Tilganger: ['B'],
        underenheter: [
          {
            orgnr: '1.1',
            erSlettet: true,
            altinn3Tilganger: [],
            altinn2Tilganger: [],
            underenheter: [],
            navn: 'SubUnit',
            organisasjonsform: 'AS'
          }
        ],
        navn: 'RootUnit',
        organisasjonsform: 'AS'
      }
    ],
    orgNrTilTilganger: {
      '1': ['X', 'Y'],
      '1.1': []
    },
    tilgangTilOrgNr: {
      '1': ['Z']
    },
    error: false
  };

  it('parses valid data successfully', () => {
    const parsed = EndepunktAltinnTilgangerSchema.parse(validData);
    expect(parsed).toEqual(validData);
  });

  it('safeParses valid data successfully', () => {
    const result = EndepunktAltinnTilgangerSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('fails on missing required top-level field', () => {
    // @ts-expect-error omit error
    const invalid = { ...validData, error: undefined };
    expect(() => EndepunktAltinnTilgangerSchema.parse(invalid)).toThrow();
    const safe = EndepunktAltinnTilgangerSchema.safeParse(invalid);
    expect(safe.success).toBe(false);
  });

  it('fails on wrong type for error field', () => {
    // @ts-expect-error wrong type
    const invalid = { ...validData, error: 'false' };
    expect(() => EndepunktAltinnTilgangerSchema.parse(invalid)).toThrow();
  });

  it('fails when nested underenhet is missing a field', () => {
    const badUnder = {
      orgnr: '1.2',
      erSlettet: false,
      altinn3Tilganger: ['C'],
      altinn2Tilganger: ['D'],
      underenheter: [],
      // missing navn
      organisasjonsform: 'AS'
    };
    const invalid = {
      ...validData,
      hierarki: [...validData.hierarki, badUnder]
    };
    expect(() => EndepunktAltinnTilgangerSchema.parse(invalid)).toThrow();
  });

  it('validates deep recursive structure', () => {
    const deep = {
      orgnr: 'root',
      erSlettet: false,
      altinn3Tilganger: [],
      altinn2Tilganger: [],
      navn: 'deep',
      organisasjonsform: 'AS',
      underenheter: [
        {
          orgnr: 'child1',
          erSlettet: false,
          altinn3Tilganger: [],
          altinn2Tilganger: [],
          navn: 'child',
          organisasjonsform: 'AS',
          underenheter: [
            {
              orgnr: 'grandchild',
              erSlettet: false,
              altinn3Tilganger: [],
              altinn2Tilganger: [],
              navn: 'grand',
              organisasjonsform: 'AS',
              underenheter: []
            }
          ]
        }
      ]
    };
    const input = {
      ...validData,
      hierarki: [deep]
    };
    expect(EndepunktAltinnTilgangerSchema.parse(input).hierarki[0]).toEqual(deep);
  });

  it('fails on invalid record values', () => {
    // @ts-expect-error number instead of array
    const badRecord = { ...validData, orgNrTilTilganger: { '1': 'not-an-array' } };
    expect(() => EndepunktAltinnTilgangerSchema.parse(badRecord)).toThrow();
  });
});
