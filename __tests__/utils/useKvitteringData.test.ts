import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useKvitteringData } from '../../utils/useKvitteringData';
import formatDate from '../../utils/formatDate';
import formatTime from '../../utils/formatTime';

const storeData = {
  bruttoinntekt: { manueltKorrigert: false },
  lonnISykefravaeret: undefined,
  sykmeldingsperioder: [],
  arbeidsgiverperioder: [],
  mottatt: undefined,
  kvitteringEksterntSystem: undefined,
  gammeltSkjaeringstidspunkt: undefined,
  kvitteringData: undefined
};

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

    expect(result.current.aktivInnsendingTidspunkt).toBe(forventet);
  });

  it('reads mottatt from an external backend receipt', () => {
    const { result } = renderHook(() =>
      useKvitteringData({
        dataFraBackend: true,
        storeData,
        kvittering: { kvitteringEkstern, kvitteringNavNo: null }
      })
    );

    expect(result.current.aktivInnsendingTidspunkt).toBe(forventet);
  });

  it('reads mottatt from a stored external receipt', () => {
    const { result } = renderHook(() =>
      useKvitteringData({
        dataFraBackend: false,
        storeData: { ...storeData, kvitteringEksterntSystem: kvitteringEkstern },
        kvittering: null
      })
    );

    expect(result.current.aktivInnsendingTidspunkt).toBe(forventet);
  });

  it('leaves the received date empty when it is missing', () => {
    const { result } = renderHook(() => useKvitteringData({ dataFraBackend: true, storeData, kvittering: null }));

    expect(result.current.aktivInnsendingTidspunkt).toBe('');
  });
});
