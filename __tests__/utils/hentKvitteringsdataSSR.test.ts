import { describe, it, expect, vi, beforeEach } from 'vitest';
import hentKvitteringsdataSSR from '../../utils/hentKvitteringsdataSSR';
import fetchKvitteringsdataSSR from '../../utils/fetchKvitteringsdataSSR';
import { z } from 'zod';

vi.mock('../../utils/fetchKvitteringsdataSSR');

describe('hentKvitteringsdataSSR', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.IM_API_URI = 'api-host';
    process.env.KVITTERINGDATA_API = '/api/kvittering';
  });

  it('should return null data when pathSlug is an array', async () => {
    const result = await hentKvitteringsdataSSR(['slug1', 'slug2'], 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should return null data when pathSlug is undefined', async () => {
    const result = await hentKvitteringsdataSSR(undefined, 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should return null data when pathSlug is empty string', async () => {
    const result = await hentKvitteringsdataSSR('', 'token');
    expect(result).toEqual({ data: null });
    expect(fetchKvitteringsdataSSR).not.toHaveBeenCalled();
  });

  it('should call fetchKvitteringsdataSSR with correct parameters when pathSlug is a string', async () => {
    const mockData = { data: { kvitteringNavNo: null, visGeneriskKvittering: true } };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue({ status: 200, ...mockData });

    const result = await hentKvitteringsdataSSR('test-slug', 'test-token');

    expect(fetchKvitteringsdataSSR).toHaveBeenCalledWith('http://api-host/api/kvittering', 'test-slug', 'test-token');
    expect(result).toEqual(mockData);
  });

  it('should call fetchKvitteringsdataSSR without token when token is undefined', async () => {
    const mockData = { data: { kvitteringNavNo: null, visGeneriskKvittering: true } };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue({ status: 200, ...mockData });

    const result = await hentKvitteringsdataSSR('test-slug', undefined);

    expect(fetchKvitteringsdataSSR).toHaveBeenCalledWith('http://api-host/api/kvittering', 'test-slug', undefined);
    expect(result).toEqual(mockData);
  });

  it.each([true, false])(
    'strips the legacy object while preserving visGeneriskKvittering=%s',
    async (visGeneriskKvittering) => {
      const data = { kvitteringNavNo: null, visGeneriskKvittering };
      vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue({
        status: 200,
        data: { ...data, kvitteringEkstern: { mottatt: 'ugyldig' } }
      });

      await expect(hentKvitteringsdataSSR('test-slug', 'test-token')).resolves.toEqual({ data });
    }
  );

  it('preserves a regular receipt without the legacy field', async () => {
    const data = {
      kvitteringNavNo: {
        sykmeldt: { fnr: '25087327879', navn: 'Test' },
        avsender: { orgnr: '911206722', orgNavn: 'Test', navn: 'Test', tlf: '12345678' },
        sykmeldingsperioder: [],
        skjema: {
          forespoerselId: '550e8400-e29b-41d4-a716-446655440000',
          avsenderTlf: '12345678',
          flereArbeidsforhold: null,
          agp: null,
          inntekt: {
            beloep: 50000,
            inntektsdato: '2026-10-01',
            naturalytelser: [],
            endringAarsaker: []
          },
          refusjon: null,
          naturalytelser: []
        },
        mottatt: '2026-10-23T13:30:00+02:00'
      },
      visGeneriskKvittering: false
    };
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue({ status: 200, data });

    await expect(hentKvitteringsdataSSR('test-slug', 'test-token')).resolves.toEqual({ data });
  });

  it('rejects a backend receipt without the required kvitteringNavNo field', async () => {
    vi.mocked(fetchKvitteringsdataSSR).mockResolvedValue({
      status: 200,
      data: { visGeneriskKvittering: true }
    });

    await expect(hentKvitteringsdataSSR('test-slug', 'test-token')).rejects.toBeInstanceOf(z.ZodError);
  });
});
