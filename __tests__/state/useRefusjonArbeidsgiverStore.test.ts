import { act, renderHook } from '@testing-library/react-hooks';
import { cleanup } from '@testing-library/react';
import useRefusjonArbeidsgiverStore from '../../state/useRefusjonArbeidsgiverStore';
import { vi } from 'vitest';
import testFnr from '../../mockdata/testFnr';

const inputPerson: [string, string, string] = ['Navn Navnesen', testFnr.GyldigeFraDolly.TestPerson1, '123456789'];

const initialState = useRefusjonArbeidsgiverStore.getState();

describe('useRefusjonArbeidsgiverStore', () => {
  beforeEach(() => {
    useRefusjonArbeidsgiverStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  // it('should initialize the data.', () => {
  //   const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

  //   act(() => {
  //     result.current.initFullLonnIArbeidsgiverPerioden(...inputPerson);
  //   });

  //   expect(result.current.navn).toBe(inputPerson[0]);
  //   expect(result.current.identitetsnummer).toBe(inputPerson[1]);
  //   expect(result.current.orgnrUnderenhet).toBe(inputPerson[2]);
  // });

  it('should set the status on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('id1', 'Ja');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.status).toBe('Ja');
  });

  it('should change the status on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('id1', 'Ja');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.status).toBe('Ja');

    act(() => {
      result.current.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('id1', 'Nei');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.status).toBe('Nei');
  });

  it('should set the status on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('id1', 'Ja');
    });

    expect(result.current.lonnISykefravaeret?.id1.status).toBe('Ja');
  });

  it('should change the status on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('id1', 'Ja');
    });

    expect(result.current.lonnISykefravaeret?.id1.status).toBe('Ja');

    act(() => {
      result.current.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret('id1', 'Nei');
    });

    expect(result.current.lonnISykefravaeret?.id1.status).toBe('Nei');
  });

  it('should set the begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', 'Begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('Begrunnelse');
  });

  it('should change the begrunnelse on fullLonnIArbeidsgiverPerioden', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', 'Begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('Begrunnelse');

    act(() => {
      result.current.begrunnelseRedusertUtbetaling('id1', 'Ny begrunnelse');
    });

    expect(result.current.fullLonnIArbeidsgiverPerioden?.id1.begrunnelse).toBe('Ny begrunnelse');
  });

  it('should set the belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '567,89');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBe(567.89);
  });

  it('should change the belop on lonnISykefravaeret', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '567,89');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBe(567.89);

    act(() => {
      result.current.beloepArbeidsgiverBetalerISykefravaeret('id1', '777,88');
    });

    expect(result.current.lonnISykefravaeret?.id1.belop).toBe(777.88);
  });

  it('should set the refusjonskravetOpphoerer Status.', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererStatus('id1', 'Ja');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.status).toBe('Ja');
  });

  it('should change the refusjonskravetOpphoerer Status.', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererStatus('id1', 'Ja');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.status).toBe('Ja');

    act(() => {
      result.current.refusjonskravetOpphoererStatus('id1', 'Nei');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.status).toBe('Nei');
  });

  it('should set the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', '2022-05-06');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 4, 6));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', '2022-05-06');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', '2022-02-09');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 1, 9));
  });

  it('should change the refusjonskravetOpphoerer date.', () => {
    const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', '2022-05-06');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 4, 6));

    act(() => {
      result.current.refusjonskravetOpphoererDato('id1', '2022-03-07');
    });

    expect(result.current.refusjonskravetOpphoerer?.id1.opphorsdato).toEqual(new Date(2022, 2, 7));
  });

  // it('should set the identitetsnummer.', () => {
  //   const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

  //   act(() => {
  //     result.current.initFullLonnIArbeidsgiverPerioden(...inputPerson);
  //   });

  //   act(() => {
  //     result.current.setIdentitetsnummer(testFnr.GyldigeFraDolly.TestPerson2);
  //   });

  //   expect(result.current.identitetsnummer).toEqual(testFnr.GyldigeFraDolly.TestPerson2);
  // });

  // it('should set the virksomhetsnavn.', () => {
  //   const { result } = renderHook(() => useRefusjonArbeidsgiverStore((state) => state));

  //   act(() => {
  //     result.current.initFullLonnIArbeidsgiverPerioden(...inputPerson);
  //   });

  //   act(() => {
  //     result.current.setOrgUnderenhet({
  //       Name: 'NAV eksempelfirma',
  //       Type: 'AS',
  //       OrganizationNumber: '912834765',
  //       OrganizationForm: 'Vet ikke',
  //       Status: 'Eksempel',
  //       ParentOrganizationNumber: '987654321'
  //     });
  //   });

  //   expect(result.current.orgnrUnderenhet).toBe('912834765');
  //   expect(result.current.virksomhetsnavn).toBe('NAV eksempelfirma');
  // });
});
