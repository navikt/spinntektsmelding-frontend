const stringishToNumber = (source: string | undefined): number | undefined => {
  return source !== undefined && source !== '' ? Number(source.replace(',', '.').replace(/\s/g, '')) : undefined;
};

export default stringishToNumber;
