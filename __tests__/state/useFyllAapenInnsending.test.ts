import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useFyllAapenInnsending, { skalSendeArbeidsgiverperiode } from '../../state/useFyllAapenInnsending';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';

import inntektData from '../../mockdata/inntektData.json';
import delvisRefusjon from '../../mockdata/kvittering-delvis-refusjon.json';
import useKvitteringInit, { KvitteringInit } from '../../state/useKvitteringInit';
import parseIsoDate from '../../utils/parseIsoDate';

vi.mock('nanoid');

const initialState = useBoundStore.getState();

function fetchMock(url, suffix = '') {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        json: () =>
          Promise.resolve({
            data: inntektData
          })
      });
    }, 20)
  );
}

describe('useFyllAapenInnsending', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock);
    nanoid.mockReturnValue('uuid');
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should fill the state stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: kvittInit } = renderHook(() => useKvitteringInit());

    const kvitteringInit = kvittInit.current;

    act(() => {
      kvitteringInit(mottattKvittering as unknown as KvitteringInit);

      result.current.initBruttoinntekt(
        500000,
        [
          { maaned: '2022-10', inntekt: 500000 },
          { maaned: '2022-11', inntekt: 500000 },
          { maaned: '2022-12', inntekt: 500000 }
        ],
        new Date()
      );

      result.current.setEndringAarsak({ aarsak: 'Bonus' });

      result.current.setInnsenderTelefon('12345678');
      result.current.setVedtaksperiodeId('8d50ef20-37b5-4829-ad83-56219e70b375');
      result.current.initRefusjonEndringer([
        { beloep: 1234, dato: parseIsoDate('2023-04-13') },
        { beloep: 12345, dato: parseIsoDate('2023-04-20') }
      ]);

      result.current.initLonnISykefravaeret({
        beloep: 5000,
        status: 'Nei'
      });

      result.current.slettAlleNaturalytelser();

      result.current.setBareNyMaanedsinntekt(500000);
    });

    const { result: fyller } = renderHook(() => useFyllAapenInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(false);
    });

    if (innsending) {
      expect(innsending.data).toEqual({
        agp: {
          perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
          egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
          redusertLoennIAgp: { beloep: 99999, begrunnelse: 'StreikEllerLockout' }
        },
        inntekt: { beloep: 500000, inntektsdato: '2023-02-14', naturalytelser: [], endringAarsak: { aarsak: 'Bonus' } },
        refusjon: null,
        vedtaksperiodeId: '8d50ef20-37b5-4829-ad83-56219e70b375',
        sykmeldtFnr: '25087327879',
        avsender: { orgnr: '911206722', tlf: '12345678' },
        sykmeldingsperioder: [
          { fom: '2023-02-20', tom: '2023-03-03' },
          { fom: '2023-03-05', tom: '2023-03-06' }
        ]
      });
    }
  });
});

describe('skalSendeArbeidsgiverperiode', () => {
  it('should return a formatted data', async () => {
    expect(skalSendeArbeidsgiverperiode(undefined, [{ fom: new Date(), tom: new Date(), id: 'id' }])).toBeTruthy();
  });

  it('should return null when kravetOpphoerer = Nei', async () => {
    expect(skalSendeArbeidsgiverperiode('FiskerMedHyre', [{ fom: undefined, tom: new Date(), id: 'id' }])).toBeFalsy();
  });

  it('should return null when kravetOpphoerer = undefined', async () => {
    expect(skalSendeArbeidsgiverperiode('Permittering', [])).toBeFalsy();
  });
});