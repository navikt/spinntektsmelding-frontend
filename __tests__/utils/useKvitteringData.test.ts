import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useKvitteringData } from '../../utils/useKvitteringData';
import formatDate from '../../utils/formatDate';
import formatTime from '../../utils/formatTime';
import parseIsoDate from '../../utils/parseIsoDate';
import { MottattKvittering } from '../../state/useKvitteringInit';

const storeData = {
  bruttoinntekt: { manueltKorrigert: false },
  sykmeldingsperioder: [],
  arbeidsgiverperioder: [],
  mottatt: undefined,
  kvitteringEksterntSystem: undefined,
  gammeltSkjaeringstidspunkt: undefined,
  kvitteringData: undefined
};

describe('useKvitteringData refusjon', () => {
  const skjema = {
    agp: null,
    refusjon: {
      beloepPerMaaned: 0,
      endringer: [
        { startdato: '2024-05-31', beloep: 100 },
        { startdato: '2024-06-01', beloep: 200 },
        { startdato: '2024-06-02', beloep: 0 }
      ]
    },
    naturalytelser: [],
    inntekt: {
      beloep: 50000,
      inntektsdato: '2024-06-01',
      naturalytelser: [],
      endringAarsak: { aarsak: 'Bonus' },
      endringAarsaker: []
    }
  } satisfies NonNullable<MottattKvittering['kvitteringNavNo']>['skjema'];
  const kvittering: MottattKvittering = {
    kvitteringEkstern: null,
    kvitteringNavNo: {
      mottatt: '2024-06-03T10:00:00+02:00',
      sykmeldt: { navn: 'Test', fnr: '12345678901' },
      avsender: { navn: 'Test', orgnr: '123456789', orgNavn: 'Test', tlf: '12345678' },
      sykmeldingsperioder: [],
      skjema
    }
  };

  it.each([true, false])(
    'preserves zero refund and filters by the determining absence day with dataFraBackend=%s',
    (dataFraBackend) => {
      const { result } = renderHook(() =>
        useKvitteringData({
          dataFraBackend,
          kvittering: dataFraBackend ? kvittering : null,
          storeData: {
            ...storeData,
            kvitteringData: {
              ...skjema,
              forespoerselId: '550e8400-e29b-41d4-a716-446655440000',
              avsenderTlf: '12345678'
            },
            gammeltSkjaeringstidspunkt: new Date(2030, 0, 1)
          }
        })
      );

      expect(result.current.refusjon.loenn).toEqual({ status: 'Ja', beloep: 0 });
      expect(result.current.refusjon.endringer).toEqual([
        { startdato: parseIsoDate('2024-06-01'), beloep: 200 },
        { startdato: parseIsoDate('2024-06-02'), beloep: 0 }
      ]);
    }
  );
});

describe('useKvitteringData mottatt', () => {
  const mottatt = '2026-10-23T13:30:00+02:00';
  const dato = new Date(mottatt);
  const forventet = ` - ${formatDate(dato)} kl. ${formatTime(dato)}`;
  const kvitteringEkstern = { avsenderSystem: 'AltinnPortal', referanse: 'AR123456', mottatt };

  it('reads mottatt from the receipt root rather than skjema', () => {
    const { result } = renderHook(() =>
      useKvitteringData({
        dataFraBackend: true,
        storeData,
        kvittering: {
          kvitteringEkstern: null,
          kvitteringNavNo: {
            mottatt,
            sykmeldt: { navn: 'Test', fnr: '12345678901' },
            avsender: { navn: 'Test', orgnr: '123456789', orgNavn: 'Test', tlf: '12345678' },
            sykmeldingsperioder: [],
            skjema: {
              agp: null,
              refusjon: null,
              naturalytelser: [],
              inntekt: {
                beloep: 50000,
                inntektsdato: '2026-10-01',
                naturalytelser: [],
                endringAarsak: { aarsak: 'Bonus' },
                endringAarsaker: []
              }
            }
          }
        }
      })
    );

    expect(result.current.innsendingTidspunkt).toBe(forventet);
  });

  it('reads mottatt from an external backend receipt', () => {
    const { result } = renderHook(() =>
      useKvitteringData({
        dataFraBackend: true,
        storeData,
        kvittering: { kvitteringEkstern, kvitteringNavNo: null }
      })
    );

    expect(result.current.innsendingTidspunkt).toBe(forventet);
  });

  it('reads mottatt from a stored external receipt', () => {
    const { result } = renderHook(() =>
      useKvitteringData({
        dataFraBackend: false,
        storeData: { ...storeData, kvitteringEksterntSystem: kvitteringEkstern },
        kvittering: null
      })
    );

    expect(result.current.innsendingTidspunkt).toBe(forventet);
  });

  it('leaves the received date empty when it is missing', () => {
    const { result } = renderHook(() => useKvitteringData({ dataFraBackend: true, storeData, kvittering: null }));

    expect(result.current.innsendingTidspunkt).toBe('');
  });
});
