import { vi } from 'vitest';
import fetcherArbeidsforhold, { endepunktArbeidsforholdSchema } from '../../utils/fetcherArbeidsforhold';

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
      body: JSON.stringify({ identitetsnummer })
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
      body: JSON.stringify({ identitetsnummer })
    });
  });
});

describe('endepunktArbeidsforholdSchema', () => {
  it('validates the schema correctly', () => {
    const data = {
      fulltNavn: 'John Doe',
      underenheter: [
        {
          orgnrUnderenhet: '810008032',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BRANNVESEN'
        },
        {
          orgnrUnderenhet: '810007842',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE'
        }
      ]
    };

    expect(endepunktArbeidsforholdSchema.safeParse(data).success).toBe(true);
  });

  it('returns an error when the schema validation fails', () => {
    const data = {
      fulltNavn: 'John Doe',
      underenheter: [
        {
          orgnrUnderenhet: '99810008032',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BRANNVESEN'
        },
        {
          orgnrUnderenhet: '810007842',
          virksomhetsnavn: 123 // Invalid type
        }
      ]
    };

    expect(endepunktArbeidsforholdSchema.safeParse(data).success).toBe(false);
  });
});
