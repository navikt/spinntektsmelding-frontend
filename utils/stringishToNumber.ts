const stringishToNumber = (source: string | undefined | number): number | undefined => {
  if (typeof source === 'number') {
    return isNaN(source) ? undefined : source;
  }
  if (source === undefined || typeof source !== 'string' || source.trim() === '') {
    return undefined;
  }
  const result = Number(source.replace(',', '.').replace(/\s/g, ''));
  return isNaN(result) ? undefined : result;
};

export default stringishToNumber;
