import { describe, it, expect } from 'vitest';
import validerPeriodeFravaer, {
  PeriodeFravaerFeilkode,
  forMangeDagerIPerioden,
  feilRekkefoelgeFomTom,
  manglerFomMenIkkeTomMedEnRad,
  manglerTomMenIkkeFomMedEnRad,
  manglerTomOgIkkeBareEnRad,
  manglerFomOgIkkeBareEnRad
} from '../../validators/validerPeriodeFravaer';
import { Periode } from '../../state/state';
import { ValiderResultat } from '../../utils/validerInntektsmelding';

describe('validerPeriodeFravaer', () => {
  const prefix = 'fravaersperioder';

  describe('Manglende perioder', () => {
    it('should return MANGLER_PERIODE when perioder is empty array', () => {
      const result = validerPeriodeFravaer([], prefix);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        felt: 'backend',
        code: PeriodeFravaerFeilkode.MANGLER_PERIODE
      });
    });

    it('should return MANGLER_PERIODE when perioder is null', () => {
      const result = validerPeriodeFravaer(null as any, prefix);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        felt: 'backend',
        code: PeriodeFravaerFeilkode.MANGLER_PERIODE
      });
    });

    it('should return MANGLER_PERIODE when perioder is undefined', () => {
      const result = validerPeriodeFravaer(undefined as any, prefix);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        felt: 'backend',
        code: PeriodeFravaerFeilkode.MANGLER_PERIODE
      });
    });
  });

  describe('Single periode validation', () => {
    it('should accept valid single periode', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-10'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(0);
    });

    it('should accept single periode with same fom and tom', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-01'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(0);
    });

    it('should return MANGLER_TIL when single periode missing tom', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: undefined,
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        felt: `${prefix}[0].tom`,
        code: PeriodeFravaerFeilkode.MANGLER_TIL
      });
    });

    it('should return MANGLER_FRA when single periode missing fom', () => {
      const perioder: Periode[] = [
        {
          fom: undefined,
          tom: new Date('2024-01-10'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        felt: `${prefix}[0].fom`,
        code: PeriodeFravaerFeilkode.MANGLER_FRA
      });
    });

    it('should not return error when single periode has both fom and tom missing', () => {
      const perioder: Periode[] = [
        {
          fom: undefined,
          tom: undefined,
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(0);
    });
  });

  describe('Multiple perioder validation', () => {
    it('should accept valid multiple perioder', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-10'),
          tom: new Date('2024-01-15'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(0);
    });

    it('should return MANGLER_FRA when second periode missing fom', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: undefined,
          tom: new Date('2024-01-15'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toContainEqual({
        felt: `${prefix}[1].fom`,
        code: PeriodeFravaerFeilkode.MANGLER_FRA
      });
    });

    it('should return MANGLER_TIL when first periode missing tom', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: undefined,
          id: '1'
        },
        {
          fom: new Date('2024-01-10'),
          tom: new Date('2024-01-15'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toContainEqual({
        felt: `${prefix}[0].tom`,
        code: PeriodeFravaerFeilkode.MANGLER_TIL
      });
    });

    it('should validate all perioder when multiple have errors', () => {
      const perioder: Periode[] = [
        {
          fom: undefined,
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-10'),
          tom: undefined,
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        felt: `${prefix}[0].fom`,
        code: PeriodeFravaerFeilkode.MANGLER_FRA
      });
      expect(result).toContainEqual({
        felt: `${prefix}[1].tom`,
        code: PeriodeFravaerFeilkode.MANGLER_TIL
      });
    });
  });

  describe('Date order validation', () => {
    it('should return TIL_FOR_FRA when tom is before fom', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-10'),
          tom: new Date('2024-01-05'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toContainEqual({
        felt: `${prefix}[0].fom`,
        code: PeriodeFravaerFeilkode.TIL_FOR_FRA
      });
    });

    it('should not return error when fom equals tom', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-05'),
          tom: new Date('2024-01-05'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining({
          code: PeriodeFravaerFeilkode.TIL_FOR_FRA
        })
      );
    });

    it('should validate date order in all perioder', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-10'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-20'),
          tom: new Date('2024-01-15'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result.filter((r) => r.code === PeriodeFravaerFeilkode.TIL_FOR_FRA)).toHaveLength(2);
    });
  });

  describe('Period length validation', () => {
    it('should return FOR_MANGE_DAGER_I_PERIODE when periode is 16 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-17'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toContainEqual({
        felt: `${prefix}-feil`,
        code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE
      });
    });

    it('should return FOR_MANGE_DAGER_I_PERIODE when periode is more than 16 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-20'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toContainEqual({
        felt: `${prefix}-feil`,
        code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE
      });
    });

    it('should accept periode of exactly 15 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-16'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining({
          code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE
        })
      );
    });

    it('should accept periode of 14 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-15'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining({
          code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE
        })
      );
    });
  });

  describe('Gap between periods validation', () => {
    it('should return FOR_MANGE_DAGER_MELLOM when gap is more than 16 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-25'),
          tom: new Date('2024-01-30'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).toContainEqual({
        felt: `${prefix}-feil`,
        code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM
      });
    });

    it('should accept gap of exactly 16 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-22'),
          tom: new Date('2024-01-25'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining([
          {
            code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM,
            felt: 'fravaersperioder-feil'
          }
        ])
      );
    });

    it('should accept gap of less than 16 days', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-10'),
          tom: new Date('2024-01-15'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining({
          code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM
        })
      );
    });

    it('should accept consecutive perioder', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-06'),
          tom: new Date('2024-01-10'),
          id: '2'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining({
          code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM
        })
      );
    });

    it('should not check gap for first periode', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result).not.toContainEqual(
        expect.objectContaining({
          code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM
        })
      );
    });

    it('should check gap between all consecutive perioder', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-05'),
          id: '1'
        },
        {
          fom: new Date('2024-01-10'),
          tom: new Date('2024-01-15'),
          id: '2'
        },
        {
          fom: new Date('2024-02-05'),
          tom: new Date('2024-02-10'),
          id: '3'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result.filter((r) => r.code === PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM)).toHaveLength(1);
    });
  });

  describe('Complex validation scenarios', () => {
    it('should return multiple errors for invalid periode', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-20'),
          tom: new Date('2024-01-01'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result).toContainEqual({
        felt: `${prefix}[0].fom`,
        code: PeriodeFravaerFeilkode.TIL_FOR_FRA
      });
    });

    it('should handle multiple perioder with various errors', () => {
      const perioder: Periode[] = [
        {
          fom: new Date('2024-01-01'),
          tom: new Date('2024-01-20'),
          id: '1'
        },
        {
          fom: new Date('2024-02-15'),
          tom: new Date('2024-02-10'),
          id: '2'
        },
        {
          fom: undefined,
          tom: new Date('2024-03-10'),
          id: '3'
        }
      ];

      const result = validerPeriodeFravaer(perioder, prefix);

      expect(result.length).toBeGreaterThan(1);
      expect(result.some((r) => r.code === PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE)).toBe(true);
      expect(result.some((r) => r.code === PeriodeFravaerFeilkode.TIL_FOR_FRA)).toBe(true);
      expect(result.some((r) => r.code === PeriodeFravaerFeilkode.MANGLER_FRA)).toBe(true);
    });
  });

  describe('Prefix handling', () => {
    it('should use provided prefix in error messages', () => {
      const customPrefix = 'egenmeldingsperioder';
      const perioder: Periode[] = [
        {
          fom: undefined,
          tom: new Date('2024-01-10'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, customPrefix);

      expect(result[0].felt).toBe(`${customPrefix}[0].fom`);
    });

    it('should handle empty string prefix', () => {
      const perioder: Periode[] = [
        {
          fom: undefined,
          tom: new Date('2024-01-10'),
          id: '1'
        }
      ];

      const result = validerPeriodeFravaer(perioder, '');

      expect(result[0].felt).toBe('[0].fom');
    });
  });
});

describe('forMangeDagerIPerioden', () => {
  const prefix = 'test';

  it('should add error when periode is exactly 16 days', () => {
    const periode: Periode = {
      fom: new Date('2024-01-01'),
      tom: new Date('2024-01-17'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    forMangeDagerIPerioden(periode, feilkoder, prefix);

    expect(feilkoder).toHaveLength(1);
    expect(feilkoder[0].code).toBe(PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE);
  });

  it('should not add error when periode is 15 days', () => {
    const periode: Periode = {
      fom: new Date('2024-01-01'),
      tom: new Date('2024-01-16'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    forMangeDagerIPerioden(periode, feilkoder, prefix);

    expect(feilkoder).toHaveLength(0);
  });

  it('should add error when periode is more than 16 days', () => {
    const periode: Periode = {
      fom: new Date('2024-01-01'),
      tom: new Date('2024-01-30'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    forMangeDagerIPerioden(periode, feilkoder, prefix);

    expect(feilkoder).toHaveLength(1);
  });
});

describe('feilRekkefoelgeFomTom', () => {
  const prefix = 'test';

  it('should add error when fom is after tom', () => {
    const periode: Periode = {
      fom: new Date('2024-01-10'),
      tom: new Date('2024-01-05'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    feilRekkefoelgeFomTom(periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(1);
    expect(feilkoder[0]).toEqual({
      felt: `${prefix}[0].fom`,
      code: PeriodeFravaerFeilkode.TIL_FOR_FRA
    });
  });

  it('should not add error when fom is before tom', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    feilRekkefoelgeFomTom(periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when fom equals tom', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: new Date('2024-01-05'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    feilRekkefoelgeFomTom(periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when fom is missing', () => {
    const periode: Periode = {
      fom: undefined,
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    feilRekkefoelgeFomTom(periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when tom is missing', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    feilRekkefoelgeFomTom(periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });
});

describe('manglerFomMenIkkeTomMedEnRad', () => {
  const prefix = 'test';

  it('should add error when single periode missing fom but has tom', () => {
    const periode: Periode = {
      fom: undefined,
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomMenIkkeTomMedEnRad(true, true, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(1);
    expect(feilkoder[0]).toEqual({
      felt: `${prefix}[0].fom`,
      code: PeriodeFravaerFeilkode.MANGLER_FRA
    });
  });

  it('should not add error when not single periode', () => {
    const periode: Periode = {
      fom: undefined,
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomMenIkkeTomMedEnRad(false, true, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when both dates are missing', () => {
    const periode: Periode = {
      fom: undefined,
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomMenIkkeTomMedEnRad(true, false, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when fom exists', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomMenIkkeTomMedEnRad(true, true, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });
});

describe('manglerTomMenIkkeFomMedEnRad', () => {
  const prefix = 'test';

  it('should add error when single periode missing tom but has fom', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomMenIkkeFomMedEnRad(true, true, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(1);
    expect(feilkoder[0]).toEqual({
      felt: `${prefix}[0].tom`,
      code: PeriodeFravaerFeilkode.MANGLER_TIL
    });
  });

  it('should not add error when not single periode', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomMenIkkeFomMedEnRad(false, true, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when both dates are missing', () => {
    const periode: Periode = {
      fom: undefined,
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomMenIkkeFomMedEnRad(true, false, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when tom exists', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomMenIkkeFomMedEnRad(true, true, periode, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });
});

describe('manglerTomOgIkkeBareEnRad', () => {
  const prefix = 'test';

  it('should add error when multiple perioder and tom is missing', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomOgIkkeBareEnRad(periode, false, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(1);
    expect(feilkoder[0]).toEqual({
      felt: `${prefix}[0].tom`,
      code: PeriodeFravaerFeilkode.MANGLER_TIL
    });
  });

  it('should not add error when single periode', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: undefined,
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomOgIkkeBareEnRad(periode, true, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when tom exists', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerTomOgIkkeBareEnRad(periode, false, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });
});

describe('manglerFomOgIkkeBareEnRad', () => {
  const prefix = 'test';

  it('should add error when multiple perioder and fom is missing', () => {
    const periode: Periode = {
      fom: undefined,
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomOgIkkeBareEnRad(periode, false, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(1);
    expect(feilkoder[0]).toEqual({
      felt: `${prefix}[0].fom`,
      code: PeriodeFravaerFeilkode.MANGLER_FRA
    });
  });

  it('should not add error when single periode', () => {
    const periode: Periode = {
      fom: undefined,
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomOgIkkeBareEnRad(periode, true, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });

  it('should not add error when fom exists', () => {
    const periode: Periode = {
      fom: new Date('2024-01-05'),
      tom: new Date('2024-01-10'),
      id: '1'
    };
    const feilkoder: ValiderResultat[] = [];

    manglerFomOgIkkeBareEnRad(periode, false, feilkoder, prefix, 0);

    expect(feilkoder).toHaveLength(0);
  });
});
