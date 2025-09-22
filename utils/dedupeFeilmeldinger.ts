export interface FeltFeil {
  felt?: string;
  text: string;
}

/**
 * Dedupliserer feilmeldinger (strenger eller FeltFeil-objekter) basert på (felt,text)-par.
 * Bevarer rekkefølgen (første forekomst vinner).
 */
export function dedupeFeilmeldinger<T extends string | FeltFeil>(list: readonly T[]): T[] {
  const seenStrings = new Set<string>();
  const seenObjects = new Set<string>();

  const result: T[] = [];
  for (const entry of list) {
    if (entry == null) continue;
    let key: string;
    if (typeof entry === 'string') {
      if (seenStrings.has(entry)) continue;
      seenStrings.add(entry);
      result.push(entry);
    } else {
      key = `${entry.felt ?? ''}::${entry.text}`;
      if (seenObjects.has(key)) continue;
      seenObjects.add(key);
      result.push(entry);
    }
  }
  return result;
}
