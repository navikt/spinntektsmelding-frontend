import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod/v4';
import { OrgNodeSchema } from '../../schema/OrgNodeSchema';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';

// Mock OrganisasjonsnummerSchema to a simple 9-digit string validator for predictable tests
vi.mock('./OrganisasjonsnummerSchema', () => ({
  OrganisasjonsnummerSchema: z.string().regex(/^\d{9}$/)
}));

describe('OrgNodeSchema', () => {
  it('accepts a valid minimal node', () => {
    const input = {
      orgnr: testOrganisasjoner[0].organizationNumber,
      navn: 'Root Org',
      underenheter: []
    };

    const result = OrgNodeSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('accepts a valid nested structure (recursive)', () => {
    const input = {
      orgnr: '111111111',
      navn: 'Root',
      underenheter: [
        {
          orgnr: '222222222',
          navn: 'Child A',
          underenheter: [
            {
              orgnr: '333333333',
              navn: 'Grandchild A1',
              underenheter: []
            }
          ]
        },
        {
          orgnr: '444444444',
          navn: 'Child B',
          underenheter: []
        }
      ]
    };

    const result = OrgNodeSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('fails when orgnr is invalid', () => {
    const input = {
      orgnr: 'invalid', // fails mocked OrganisasjonsnummerSchema
      navn: 'Org',
      underenheter: []
    };

    const result = OrgNodeSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'orgnr')).toBe(true);
    }
  });

  it('fails when "underenheter" is missing', () => {
    const input: any = {
      orgnr: '123456789',
      navn: 'Org'
      // underenheter missing
    };

    const result = OrgNodeSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'underenheter')).toBe(true);
    }
  });

  it('fails when a child node is invalid (missing navn)', () => {
    const input = {
      orgnr: '123456789',
      navn: 'Root',
      underenheter: [
        {
          orgnr: '987654321',
          // navn missing
          underenheter: []
        } as any
      ]
    };

    const result = OrgNodeSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Expect error path to point into underenheter[0].navn
      expect(
        result.error.issues.some(
          (i) => i.path.length === 3 && i.path[0] === 'underenheter' && i.path[1] === 0 && i.path[2] === 'navn'
        )
      ).toBe(true);
    }
  });
});
