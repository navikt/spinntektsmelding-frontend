import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useFyllInnsending, {
  formaterRedusertLoennIAgp,
  mapEgenmeldingsperioder,
  mapNaturalytelserToData,
  concatPerioder,
  konverterPerioderFraMottattTilInterntFormat,
  finnInnsendbareArbeidsgiverperioder,
  konverterRefusjonEndringer
} from '../../state/useFyllInnsending';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';

import inntektData from '../../mockdata/inntektData.json';
import delvisRefusjon from '../../mockdata/kvittering-delvis-refusjon.json';
import useKvitteringInit from '../../state/useKvitteringInit';
import { LonnIArbeidsgiverperioden } from '../../state/state';
import FullInnsendingSchema from '../../schema/FullInnsendingSchema';
import { z } from 'zod/v4';

import MottattKvitteringSchema from '../../schema/MottattKvitteringSchema';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import parseIsoDate from '../../utils/parseIsoDate';

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
  },
  refusjon: {
    beloepPerMaaned: 80666.66666666667,
    isEditing: false,
    endringer: [
      { beloep: 1234, dato: parseIsoDate('2023-04-13')! },
      { beloep: 12345, dato: parseIsoDate('2023-04-20')! },
      {
        beloep: 0,
        dato: parseIsoDate('2023-04-19')!
      }
    ],
    harEndringer: 'Ja'
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

  it('should fill the state without arbeidsgiverperiode', async () => {
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
        '8d50ef20-37b5-4829-ad83-56219e70b375',
        ['inntekt', 'refusjon'], // Uten 'arbeidsgiverperiode'
        skjemaData
      );
    });

    if (innsending) {
      // AGP skal fortsatt ha perioder, men vil bruke foreslaattBestemmendeFravaersdag
      expect(innsending.inntekt?.beloep).toBe(12345);
      expect(innsending.refusjon?.beloepPerMaaned).toBe(80666.66666666667);
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

describe('mapEgenmeldingsperioder', () => {
  it('should return empty array when egenmeldingsperioder is undefined', () => {
    expect(mapEgenmeldingsperioder(undefined)).toEqual([]);
  });

  it('should map periods correctly', () => {
    const perioder = [
      { fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' },
      { fom: new Date('2023-01-10'), tom: new Date('2023-01-15'), id: '2' }
    ];
    const result = mapEgenmeldingsperioder(perioder);
    expect(result).toEqual([
      { fom: '2023-01-01', tom: '2023-01-05' },
      { fom: '2023-01-10', tom: '2023-01-15' }
    ]);
  });

  it('should filter out periods without dates', () => {
    const perioder = [
      { fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' },
      { fom: undefined, tom: undefined, id: '2' }
    ];
    const result = mapEgenmeldingsperioder(perioder);
    expect(result).toHaveLength(1);
  });
});

describe('mapNaturalytelserToData', () => {
  it('should return empty array when naturalytelser is undefined', () => {
    expect(mapNaturalytelserToData(undefined)).toEqual([]);
  });

  it('should map naturalytelser correctly', () => {
    const naturalytelser = [{ naturalytelse: 'AKSJERGRATIS', sluttdato: new Date('2023-06-01'), verdiBeloep: 500 }];
    const result = mapNaturalytelserToData(naturalytelser as any);
    expect(result).toEqual([{ naturalytelse: 'AKSJERGRATIS', sluttdato: '2023-06-01', verdiBeloep: 500 }]);
  });
});

describe('concatPerioder', () => {
  it('should return egenmeldingsperioder when sykmeldingsperioder is undefined', () => {
    const egenmeldinger = [{ fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' }];
    expect(concatPerioder(undefined, egenmeldinger)).toEqual(egenmeldinger);
  });

  it('should concatenate both period arrays', () => {
    const sykmelding = [{ fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' }];
    const egenmelding = [{ fom: new Date('2023-01-10'), tom: new Date('2023-01-15'), id: '2' }];
    const result = concatPerioder(sykmelding, egenmelding);
    expect(result).toHaveLength(2);
  });

  it('should handle undefined egenmeldingsperioder', () => {
    const sykmelding = [{ fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' }];
    const result = concatPerioder(sykmelding, undefined);
    expect(result).toHaveLength(1);
  });
});

describe('konverterPerioderFraMottattTilInterntFormat', () => {
  it('should return undefined when input is undefined', () => {
    expect(konverterPerioderFraMottattTilInterntFormat(undefined)).toBeUndefined();
  });

  it('should convert periods to internal format', () => {
    const perioder = [
      { fom: '2023-01-01', tom: '2023-01-05' },
      { fom: '2023-01-10', tom: '2023-01-15' }
    ];
    const result = konverterPerioderFraMottattTilInterntFormat(perioder);
    expect(result).toHaveLength(2);
    expect(result![0].fom).toBeInstanceOf(Date);
    expect(result![0].tom).toBeInstanceOf(Date);
    expect(result![0].id).toBe('id');
  });
});

describe('finnInnsendbareArbeidsgiverperioder', () => {
  it('should return empty array when harForespurtArbeidsgiverperiode is false', () => {
    const perioder = [{ fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' }];
    expect(finnInnsendbareArbeidsgiverperioder(perioder, false)).toEqual([]);
  });

  it('should return empty array when arbeidsgiverperioder is undefined', () => {
    expect(finnInnsendbareArbeidsgiverperioder(undefined, true)).toEqual([]);
  });

  it('should return empty array when arbeidsgiverperioder is empty', () => {
    expect(finnInnsendbareArbeidsgiverperioder([], true)).toEqual([]);
  });

  it('should map and filter valid periods', () => {
    const perioder = [
      { fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' },
      { fom: new Date('2023-01-10'), tom: new Date('2023-01-15'), id: '2' }
    ];
    const result = finnInnsendbareArbeidsgiverperioder(perioder, true);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ fom: '2023-01-01', tom: '2023-01-05' });
  });

  it('should filter out periods with invalid dates', () => {
    const perioder = [
      { fom: new Date('2023-01-01'), tom: new Date('2023-01-05'), id: '1' },
      { fom: undefined, tom: undefined, id: '2' }
    ];
    const result = finnInnsendbareArbeidsgiverperioder(perioder, true);
    expect(result).toHaveLength(1);
  });
});

describe('konverterRefusjonEndringer', () => {
  it('should return empty array when harRefusjonEndringer is not Ja', () => {
    const endringer = [{ beloep: 1000, dato: new Date('2023-06-01') }];
    expect(konverterRefusjonEndringer('Nei', endringer)).toEqual([]);
  });

  it('should return empty array when refusjonEndringer is undefined', () => {
    expect(konverterRefusjonEndringer('Ja', undefined)).toEqual([]);
  });

  it('should convert refusjon endringer correctly', () => {
    const endringer = [
      { beloep: 1000, dato: new Date('2023-06-01') },
      { beloep: 2000, dato: new Date('2023-07-01') }
    ];
    const result = konverterRefusjonEndringer('Ja', endringer);
    expect(result).toEqual([
      { beloep: 1000, startdato: '2023-06-01' },
      { beloep: 2000, startdato: '2023-07-01' }
    ]);
  });

  it('should return empty array when result array is empty', () => {
    expect(konverterRefusjonEndringer('Ja', [])).toEqual([]);
  });
});
