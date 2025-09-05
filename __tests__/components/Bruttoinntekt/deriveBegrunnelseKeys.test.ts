import { describe, it, expect } from 'vitest';
import begrunnelseEndringBruttoinntekt from '../../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { deriveBegrunnelseKeys, EndringAarsakLike } from '../../../components/Bruttoinntekt/deriveBegrunnelseKeys';

const ALL = Object.keys(begrunnelseEndringBruttoinntekt);

function sort(arr: string[]) {
  return [...arr].sort();
}

describe('deriveBegrunnelseKeys', () => {
  it('returnerer alle nøkler minus Tariffendring ved ny innsending når ingen er valgt', () => {
    const result = deriveBegrunnelseKeys({ nyInnsending: true });
    expect(sort(result)).toEqual(sort(ALL.filter((k) => k !== 'Tariffendring')));
  });

  it('inkluderer Tariffendring når ikke ny innsending', () => {
    const result = deriveBegrunnelseKeys({ nyInnsending: false });
    expect(sort(result)).toEqual(sort(ALL));
  });

  it('fjerner allerede valgte begrunnelser', () => {
    const valgte: EndringAarsakLike[] = [{ aarsak: 'Ferie' }, { aarsak: 'Permisjon' }];
    const result = deriveBegrunnelseKeys({ nyInnsending: false, valgteBegrunnelser: valgte });
    expect(result).not.toContain('Ferie');
    expect(result).not.toContain('Permisjon');
  });

  it('beholder currentBegrunnelse selv om den ellers ville blitt filtrert bort (ny innsending & Tariffendring)', () => {
    const result = deriveBegrunnelseKeys({ nyInnsending: true, currentBegrunnelse: 'Tariffendring' });
    expect(result).toContain('Tariffendring');
  });

  it('dupliserer ikke currentBegrunnelse om den allerede er tilgjengelig', () => {
    const result = deriveBegrunnelseKeys({ nyInnsending: false, currentBegrunnelse: 'Ferie' });
    const ferieCount = result.filter((r) => r === 'Ferie').length;
    expect(ferieCount).toBe(1);
  });

  it('returnerer tomt array når alle nøkler er valgt og ny innsending (uten current)', () => {
    const valgte = ALL.map((a) => ({ aarsak: a }));
    const result = deriveBegrunnelseKeys({ nyInnsending: true, valgteBegrunnelser: valgte });
    // Tariffendring fjernes pga nyInnsending; resten fjernet fordi de er valgt
    expect(result).toEqual([]);
  });

  it('returnerer kun current når alle andre er valgt og ikke ny innsending', () => {
    const allButOne = ALL.slice(1); // drop first key; we'll use it as current
    const valgte = allButOne.map((a) => ({ aarsak: a }));
    const current = ALL[0];
    const result = deriveBegrunnelseKeys({
      nyInnsending: false,
      valgteBegrunnelser: valgte,
      currentBegrunnelse: current
    });
    expect(result).toEqual([current]);
  });
});
