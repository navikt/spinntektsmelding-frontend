import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';
import useArbeidsforhold from '../../utils/useArbeidsforhold';
import useInitieringData from '../../utils/useInitieringData';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';

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
