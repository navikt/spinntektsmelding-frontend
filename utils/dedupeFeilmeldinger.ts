export interface FeltFeil {
  felt?: string;
  text: string;
}

/**
 * Dedupliserer feilmeldinger (strenger eller FeltFeil-objekter) basert på (felt,text)-par.
 * Bevarer rekkefølgen (første forekomst vinner).
 */
export function dedupeFeilmeldinger<T extends string | FeltFeil>(list: readonly T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const entry of list) {
    if (entry == null) continue;
    let key: string;
    if (typeof entry === 'string') {
      key = `__str__::${entry}`;
    } else {
      key = `${entry.felt ?? ''}::${entry.text}`;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }
  return result;
}
