import { OrgNode } from '../schema/OrgNodeSchema';

export function collectNestedOrgs(nodes: OrgNode[]): { orgnr: string; navn: string }[] {
  const result: { orgnr: string; navn: string }[] = [];
  function walk(node: OrgNode) {
    for (const child of node.underenheter) {
      result.push({ orgnr: child.orgnr, navn: child.navn });
      walk(child);
    }
  }
  for (const n of nodes) {
    walk(n);
  }
  return result;
}
