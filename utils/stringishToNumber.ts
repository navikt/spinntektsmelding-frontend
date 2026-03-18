const stringishToNumber = (source: string | undefined | number): number | undefined => {
  if (typeof source === 'number') {
    return Number.isNaN(source) ? undefined : source;
  }
  if (source === undefined || typeof source !== 'string' || source.trim() === '') {
    return undefined;
  }
  const result = Number(source.replaceAll(',', '.').replaceAll(/\s/g, ''));
  return Number.isNaN(result) ? undefined : result;
};

export default stringishToNumber;
