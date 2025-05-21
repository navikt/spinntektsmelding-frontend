import { ApiEndringAarsakSchema } from '../../schema/ApiEndringAarsakSchema';

describe('ApiEndringAarsakSchema', () => {
  it('should validate ApiEndringAarsakSchema for Bonus', () => {
    const data = {
      aarsak: 'Bonus'
    };

    const expected = {
      aarsak: 'Bonus'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Feilregistrert', () => {
    const data = {
      aarsak: 'Feilregistrert'
    };

    const expected = {
      aarsak: 'Feilregistrert'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Ferie', () => {
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

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Ferietrekk', () => {
    const data = {
      aarsak: 'Ferietrekk'
    };

    const expected = {
      aarsak: 'Ferietrekk'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for SammeSomSist', () => {
    const data = {
      aarsak: 'SammeSomSist'
    };

    const expected = {
      aarsak: 'SammeSomSist'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Nyansatt', () => {
    const data = {
      aarsak: 'Nyansatt'
    };

    const expected = {
      aarsak: 'Nyansatt'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for NyStilling', () => {
    const data = {
      aarsak: 'NyStilling',
      gjelderFra: '2021-01-01'
    };

    const expected = {
      aarsak: 'NyStilling',
      gjelderFra: '2021-01-01'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for NyStillingsprosent', () => {
    const data = {
      aarsak: 'NyStillingsprosent',
      gjelderFra: '2021-01-01'
    };

    const expected = {
      aarsak: 'NyStillingsprosent',
      gjelderFra: '2021-01-01'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Permisjon', () => {
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

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Permittering', () => {
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

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Sykefravaer', () => {
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

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for Tariffendring', () => {
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

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should validate ApiEndringAarsakSchema for VarigLoennsendring', () => {
    const data = {
      aarsak: 'VarigLoennsendring',
      gjelderFra: '2021-01-01'
    };

    const expected = {
      aarsak: 'VarigLoennsendring',
      gjelderFra: '2021-01-01'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should not validate ApiEndringAarsakSchema for Error', () => {
    const data = {
      aarsak: 'Error'
    };

    const expected = {
      aarsak: 'Error'
    };

    const parsed = ApiEndringAarsakSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    expect(parsed.data).toBeUndefined();
  });
});
