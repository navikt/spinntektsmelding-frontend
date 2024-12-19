const isObject = (obj: any): boolean => Boolean(obj) && typeof obj === 'object' && !Array.isArray(obj);

export default isObject;
