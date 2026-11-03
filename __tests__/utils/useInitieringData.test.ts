import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import useInitieringData from '../../utils/useInitieringData';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import formatDate from '../../utils/formatDate';

vi.mock('../../utils/useArbeidsforhold', () => ({ default: vi.fn() }));
vi.mock('../../utils/useSykepengesoeknader', () => ({ default: vi.fn() }));

describe('useInitieringData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
  });

  it.each([
    { fom: '2023-01-01', tom: '2023-01-10', forventetFom: '01.01.2023', forventetTom: '10.01.2023' },
    { fom: '2023-07-01', tom: '2023-07-10', forventetFom: '01.07.2023', forventetTom: '10.07.2023' }
  ])('preserves calendar dates when formatting periods starting $fom', ({ fom, tom, forventetFom, forventetTom }) => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: { fulltNavn: 'Testperson', underenheter: [] },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: {
        forespoersler: [],
        soeknaderArbeidstaker: [
          {
            sykmeldingsperiode: { fom, tom },
            egenmeldingsperioder: [{ fom, tom }],
            erGradert: false,
            vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
          }
        ],
        soeknaderBehandlingsdager: []
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });

    const { result } = renderHook(() => useInitieringData('testperson', undefined, vi.fn()));
    const periode = result.current.sykepengePerioder[0];

    expect(formatDate(periode.fom)).toBe(forventetFom);
    expect(formatDate(periode.tom)).toBe(forventetTom);
    expect(formatDate(periode.egenmeldingsperioder?.[0].fom)).toBe(forventetFom);
    expect(formatDate(periode.egenmeldingsperioder?.[0].tom)).toBe(forventetTom);
    expect(periode.fom.getHours()).toBe(0);
    expect(periode.tom.getHours()).toBe(0);
  });

  it.each([1, 2])('preserves mapped arbeidsforhold when changing organisation with %i units', (antallEnheter) => {
    const underenheter = testOrganisasjoner.slice(0, antallEnheter).map((org, index) => ({
      orgnrUnderenhet: org.organizationNumber,
      virksomhetsnavn: `Arbeidsgiver ${index}`
    }));
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: { fulltNavn: 'Testperson', underenheter },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    const setError = vi.fn();
    const initialProps: { orgnr: string | undefined } = { orgnr: undefined };
    const { result, rerender } = renderHook(
      ({ orgnr }: { orgnr: string | undefined }) => useInitieringData('testperson', orgnr, setError),
      { initialProps }
    );
    const arbeidsforhold = result.current.arbeidsforhold;
    const automatiskOrgnr = antallEnheter === 1 ? underenheter[0].orgnrUnderenhet : undefined;
    expect(result.current.organisasjonsnummer).toBe(automatiskOrgnr);

    const valgtOrgnr = testOrganisasjoner[1].organizationNumber;
    rerender({ orgnr: valgtOrgnr });

    expect(result.current.arbeidsforhold).toBe(arbeidsforhold);
    expect(result.current.organisasjonsnummer).toBe(valgtOrgnr);
    expect(useSykepengesoeknader).toHaveBeenLastCalledWith('testperson', valgtOrgnr, setError);

    rerender({ orgnr: undefined });

    expect(result.current.arbeidsforhold).toBe(arbeidsforhold);
    expect(result.current.organisasjonsnummer).toBe(automatiskOrgnr);
    expect(useSykepengesoeknader).toHaveBeenLastCalledWith('testperson', automatiskOrgnr ?? '', setError);
  });
});
