import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useFyllInnsending, { formaterRedusertLoennIAgp } from '../../state/useFyllInnsending';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';

import inntektData from '../../mockdata/inntektData.json';
import delvisRefusjon from '../../mockdata/kvittering-delvis-refusjon.json';
import useKvitteringInit from '../../state/useKvitteringInit';
import { LonnIArbeidsgiverperioden } from '../../state/state';
import FullInnsendingSchema from '../../schema/FullInnsendingSchema';
import { z } from 'zod';

import MottattKvitteringSchema from '../../schema/MottattKvitteringSchema';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';

type Skjema = z.infer<typeof HovedskjemaSchema>;
type InnsendingSkjema = z.infer<typeof FullInnsendingSchema>;
type KvitteringData = z.infer<typeof MottattKvitteringSchema>;

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

const skjemaData: Skjema = {
  bekreft_opplysninger: true,
  inntekt: {
    beloep: 12345,
    endringAarsaker: null,

    inntektsdato: '2021-01-01',
    naturalytelser: []
  }
};

describe('useFyllInnsending', () => {
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
      kvitteringInit(mottattKvittering as unknown as KvitteringData);
    });

    const { result: fyller } = renderHook(() => useFyllInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(
        false,
        '8d50ef20-37b5-4829-ad83-56219e70b375',
        ['arbeidsgiverperiode', 'inntekt', 'refusjon'],
        skjemaData
      );
    });

    if (innsending) {
      // expect(innsending.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
      // expect(innsending.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);

      expect(innsending.agp?.egenmeldinger).toEqual([
        {
          fom: mottattKvittering.kvitteringNavNo.skjema.agp.egenmeldinger[0].fom,
          tom: mottattKvittering.kvitteringNavNo.skjema.agp.egenmeldinger[0].tom
        }
      ]);
      // expect(innsending.refusjon.utbetalerHeleEllerDeler).toBeTruthy();
      expect(innsending.refusjon?.beloepPerMaaned).toBe(80666.66666666667);
      expect(innsending.inntekt?.beloep).toBe(12345);
      // expect(innsending.inntekt.bekreftet).toBeTruthy();
    }
  });

  it('should fill the state stuff - delvis', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: kvittInit } = renderHook(() => useKvitteringInit());

    const kvitteringInit = kvittInit.current;

    act(() => {
      kvitteringInit(delvisRefusjon as unknown as KvitteringData);
    });

    const { result: fyller } = renderHook(() => useFyllInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema = {} as InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(
        false,
        '8d50ef20-37b5-4829-ad83-56219e70b375',
        ['arbeidsgiverperiode', 'inntekt', 'refusjon'],
        skjemaData
      );
    });

    if (innsending) {
      // expect(innsending.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
      // expect(innsending.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);

      // expect(innsending.agp.egenmeldinger).toEqual([
      //   {
      //     fom: mottattKvittering.kvitteringNavNo.skjema.agp.egenmeldinger[0].fom,
      //     tom: mottattKvittering.kvitteringNavNo.skjema.agp.egenmeldinger[0].tom
      //   }
      // ]);
      // expect(innsending.refusjon.utbetalerHeleEllerDeler).toBeTruthy();
      expect(innsending.refusjon?.beloepPerMaaned).toBe(80666.66666666667);
      expect(innsending.refusjon?.sluttdato).toBeNull();
      expect(innsending.refusjon?.endringer).toEqual([
        { beloep: 1234, startdato: '2023-04-13' },
        { beloep: 12345, startdato: '2023-04-20' },
        {
          beloep: 0,
          startdato: '2023-04-19'
        }
      ]);
      expect(innsending.inntekt?.beloep).toBe(12345);
      // expect(innsending.inntekt.bekreftet).toBeTruthy();
    } else {
      expect(innsending).toBeTruthy();
    }
  });
});

describe('formaterRedusertLoennIAgp', () => {
  it('should return a formatted json', async () => {
    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 1234
    };

    expect(formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)).toEqual({
      begrunnelse: 'ArbeidOpphoert',
      beloep: 1234
    });
  });

  it('should return a formatted json, when utbetalt = undefined', async () => {
    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: undefined
    };

    expect(formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)).toEqual({
      begrunnelse: 'ArbeidOpphoert',
      beloep: 0
    });
  });

  it('should return null, when status = Ja', async () => {
    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: undefined
    };

    expect(formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)).toBeNull();
  });

  it('should return null, when status = Ja', async () => {
    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 1234
    };

    expect(formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)).toBeNull();
  });

  it('should return null, when begrunnelse is empty string', async () => {
    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: '',
      utbetalt: 1234
    };

    expect(formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)).toBeNull();
  });

  it('should return null, when begrunnelse is undefined', async () => {
    const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: undefined,
      utbetalt: 1234
    };

    expect(formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)).toBeNull();
  });
});
