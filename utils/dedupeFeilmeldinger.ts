import { FeltFeil } from './sendInnCommon';

export function dedupeFeilmeldinger<T extends string | FeltFeil>(list: readonly T[]): T[] {
  const seenKeys = new Set<string>();

  const result: T[] = [];
  for (const entry of list) {
    if (entry == null) continue;
    let key: string;
    if (typeof entry === 'string') {
      key = entry;
    } else {
      key = `${entry.felt ?? ''}::${entry.text}`;
    }
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    result.push(entry);
  }
  return result;
}
