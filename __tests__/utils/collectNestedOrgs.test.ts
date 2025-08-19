import { describe, it, expect } from 'vitest';
import { collectNestedOrgs } from '../../utils/collectNestedOrgs';
import { OrgNode } from '../../schema/OrgNodeSchema';

function node(orgnr: string, navn: string, underenheter: OrgNode[] = []): OrgNode {
  return { orgnr, navn, underenheter };
}

describe('collectNestedOrgs', () => {
  it('returns empty array for empty input', () => {
    expect(collectNestedOrgs([])).toEqual([]);
  });

  it('returns empty array when roots have no children', () => {
    const roots: OrgNode[] = [node('100', 'A'), node('200', 'B')];
    expect(collectNestedOrgs(roots)).toEqual([]);
  });

  it('collects only nested units (excluding roots) in depth-first order for a single root', () => {
    // Root A
    const d = node('103', 'D');
    const e = node('104', 'E');
    const b = node('101', 'B', [d, e]);

    const f = node('105', 'F');
    const c = node('102', 'C', [f]);

    const a = node('100', 'A', [b, c]);

    const result = collectNestedOrgs([a]);
    expect(result).toEqual([
      { orgnr: '101', navn: 'B' },
      { orgnr: '103', navn: 'D' },
      { orgnr: '104', navn: 'E' },
      { orgnr: '102', navn: 'C' },
      { orgnr: '105', navn: 'F' }
    ]);

    // Ensure root is not included
    expect(result.find((r) => r.orgnr === '100')).toBeUndefined();
  });

  it('concatenates depth-first traversal across multiple roots in order', () => {
    // Root A subtree
    const d = node('103', 'D');
    const e = node('104', 'E');
    const b = node('101', 'B', [d, e]);
    const f = node('105', 'F');
    const c = node('102', 'C', [f]);
    const a = node('100', 'A', [b, c]);

    // Root X subtree
    const y = node('201', 'Y');
    const z = node('202', 'Z');
    const x = node('200', 'X', [y, z]);

    const result = collectNestedOrgs([a, x]);
    expect(result).toEqual([
      { orgnr: '101', navn: 'B' },
      { orgnr: '103', navn: 'D' },
      { orgnr: '104', navn: 'E' },
      { orgnr: '102', navn: 'C' },
      { orgnr: '105', navn: 'F' },
      { orgnr: '201', navn: 'Y' },
      { orgnr: '202', navn: 'Z' }
    ]);

    // Roots excluded
    const roots = new Set(['100', '200']);
    expect(result.some((r) => roots.has(r.orgnr))).toBe(false);
  });

  it('handles deep single-branch nesting', () => {
    const n4 = node('4', 'N4');
    const n3 = node('3', 'N3', [n4]);
    const n2 = node('2', 'N2', [n3]);
    const n1 = node('1', 'N1', [n2]);

    const result = collectNestedOrgs([n1]);
    expect(result).toEqual([
      { orgnr: '2', navn: 'N2' },
      { orgnr: '3', navn: 'N3' },
      { orgnr: '4', navn: 'N4' }
    ]);
  });
});
