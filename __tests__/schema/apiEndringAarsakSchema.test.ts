import { EndringAarsakSchema } from '../../schema/apiEndringAarsakSchema';

describe('EndringAarsakSchema', () => {
  it('should validate EndringAarsakSchema for Bonus', () => {
    const data = {
      aarsak: 'Bonus'
    };

    const expected = {
      aarsak: 'Bonus'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Feilregistrert', () => {
    const data = {
      aarsak: 'Feilregistrert'
    };

    const expected = {
      aarsak: 'Feilregistrert'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Ferie', () => {
    const data = {
      aarsak: 'Ferie',
      ferier: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const expected = {
      aarsak: 'Ferie',
      ferier: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Ferietrekk', () => {
    const data = {
      aarsak: 'Ferietrekk'
    };

    const expected = {
      aarsak: 'Ferietrekk'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for SammeSomSist', () => {
    const data = {
      aarsak: 'SammeSomSist'
    };

    const expected = {
      aarsak: 'SammeSomSist'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Nyansatt', () => {
    const data = {
      aarsak: 'Nyansatt'
    };

    const expected = {
      aarsak: 'Nyansatt'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for NyStilling', () => {
    const data = {
      aarsak: 'NyStilling',
      gjelderFra: '2021-01-01'
    };

    const expected = {
      aarsak: 'NyStilling',
      gjelderFra: '2021-01-01'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for NyStillingsprosent', () => {
    const data = {
      aarsak: 'NyStillingsprosent',
      gjelderFra: '2021-01-01'
    };

    const expected = {
      aarsak: 'NyStillingsprosent',
      gjelderFra: '2021-01-01'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Permisjon', () => {
    const data = {
      aarsak: 'Permisjon',
      permisjoner: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const expected = {
      aarsak: 'Permisjon',
      permisjoner: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Permittering', () => {
    const data = {
      aarsak: 'Permittering',
      permitteringer: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const expected = {
      aarsak: 'Permittering',
      permitteringer: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Sykefravaer', () => {
    const data = {
      aarsak: 'Sykefravaer',
      sykefravaer: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const expected = {
      aarsak: 'Sykefravaer',
      sykefravaer: [
        {
          fom: '2021-01-01',
          tom: '2021-01-02'
        }
      ]
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for Tariffendring', () => {
    const data = {
      aarsak: 'Tariffendring',
      gjelderFra: '2021-01-01',
      bleKjent: '2021-01-02'
    };

    const expected = {
      aarsak: 'Tariffendring',
      gjelderFra: '2021-01-01',
      bleKjent: '2021-01-02'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate EndringAarsakSchema for VarigLoennsendring', () => {
    const data = {
      aarsak: 'VarigLoennsendring',
      gjelderFra: '2021-01-01'
    };

    const expected = {
      aarsak: 'VarigLoennsendring',
      gjelderFra: '2021-01-01'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should not validate EndringAarsakSchema for Error', () => {
    const data = {
      aarsak: 'Error'
    };

    const expected = {
      aarsak: 'Error'
    };

    const parsed = EndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    expect(parsed.data).toBeUndefined();
  });
});
