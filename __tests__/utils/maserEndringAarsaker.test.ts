import { describe, it, expect } from 'vitest';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import maserEndringAarsaker from '../../utils/maserEndringAarsaker';

describe('maserEndringAarsaker', () => {
  const singleEndringAarsak: EndringAarsak = { aarsak: 'Bonus' };
  const multipleEndringAarsaker: EndringAarsak[] = [{ aarsak: 'Bonus' }, { aarsak: 'Feilregistrert' }];

  it('should return the single endringAarsak in an array when endringAarsaker is empty', () => {
    const result = maserEndringAarsaker(singleEndringAarsak, []);
    expect(result).toEqual([singleEndringAarsak]);
    expect(result.length).toBe(1);
  });

  it('should return the single endringAarsak in an array when endringAarsaker is undefined', () => {
    const result = maserEndringAarsaker(singleEndringAarsak, undefined as unknown as EndringAarsak[]);
    expect(result).toEqual([singleEndringAarsak]);
  });

  it('should return endringAarsaker array unchanged when it has items', () => {
    const result = maserEndringAarsaker(singleEndringAarsak, multipleEndringAarsaker);
    expect(result).toBe(multipleEndringAarsaker);
    expect(result).toEqual(multipleEndringAarsaker);
    expect(result.length).toBe(2);
  });
});
