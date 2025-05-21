export function countTrue(data: unknown): number {
  let total = 0;

  function walk(value: any): void {
    if (value === true) {
      total++;
    } else if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
    } else if (value && typeof value === 'object') {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          walk((value as Record<string, unknown>)[key]);
        }
      }
    }
  }

  walk(data);
  return total;
}
