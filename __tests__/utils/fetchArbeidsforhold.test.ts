import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetchArbeidsforhold from '../../utils/fetchArbeidsforhold';
import environment from '../../config/environment';

describe('fetchArbeidsforhold', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when required params are missing', () => {
    expect(() => fetchArbeidsforhold('', undefined, undefined, undefined)).toThrow(
      'Kunne ikke hente arbeidsforhold, parameter mangler'
    );
  });

  it('posts expected payload and returns parsed response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ansettelsesforhold: [] })
    } as unknown as Response);

    const result = await fetchArbeidsforhold(
      '810007842',
      '10107400090',
      new Date('2024-12-06T00:00:00.000Z'),
      new Date('2024-12-30T00:00:00.000Z')
    );

    expect(fetchSpy).toHaveBeenCalledWith(environment.hentAnsettelsesforholdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgnr: '810007842',
        sykmeldtFnr: '10107400090',
        fom: '2024-12-06',
        tom: '2024-12-30'
      })
    });
    expect(result).toEqual({ ansettelsesforhold: [] });
  });

  it('maps non-ok response to expected NetworkError message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({})
    } as unknown as Response);

    await expect(
      fetchArbeidsforhold('810007842', '10107400090', new Date('2024-12-06'), new Date('2024-12-30'))
    ).rejects.toMatchObject({
      message: 'Kunne ikke tolke resultatet fra serveren',
      status: 500
    });
  });
});
