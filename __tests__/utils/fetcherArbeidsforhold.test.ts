import { vi } from 'vitest';
import fetcherArbeidsforhold from '../../utils/fetcherArbeidsforhold';

describe('fetcherArbeidsforhold', () => {
  it('returns an empty array when identitetsnummer is not provided', async () => {
    const url = 'http://example.com/api/arbeidsforhold';

    const result = await fetcherArbeidsforhold(url);

    expect(result).toEqual([]);
  });

  it('returns the fetched data when the request is successful', async () => {
    const url = 'http://example.com/api/arbeidsforhold';
    const identitetsnummer = '123456789';

    const mockResponse = {
      fulltNavn: 'John Doe',
      underenheter: [
        {
          orgnrUnderenhet: '123',
          virksomhetsnavn: 'Company A'
        },
        {
          orgnrUnderenhet: '456',
          virksomhetsnavn: 'Company B'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    } as any);

    const result = await fetcherArbeidsforhold(url, identitetsnummer);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sykmeldtFnr: identitetsnummer })
    });
  });

  it('throws an error when the request fails', async () => {
    const url = 'http://example.com/api/arbeidsforhold';
    const identitetsnummer = '123456789';

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false
    } as any);

    await expect(fetcherArbeidsforhold(url, identitetsnummer)).rejects.toThrowError(
      'Kunne ikke tolke resultatet fra serveren'
    );
    expect(global.fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sykmeldtFnr: identitetsnummer })
    });
  });
});
