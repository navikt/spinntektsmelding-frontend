import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect } from 'vitest';
import Kvittering from '../../pages/kvittering/[kvittid]';

import env from '../../config/environment';
import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import forespoerselType from '../../config/forespoerselType';
import { Opplysningstype } from '../../schema/ForespurtDataSchema';

global.window = Object.create(window);
Object.defineProperty(global.window, 'location', {
  value: {
    ...window.location,
    replace: vi.fn()
  },
  writable: true
});

// vi.mock('next/router', () => require('next-router-mock'));
const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  default: {},
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet })
}));

const initialState = useBoundStore.getState();

describe('kvittering', () => {
  beforeEach(() => {
    const spy = vi.spyOn(window, 'print');
    vi.spyOn(env, 'saksoversiktUrl', 'get').mockReturnValue('https://mocked.nav.no');

    spy.mockImplementation(vi.fn());

    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('renders a title text', () => {
    const spy = vi.spyOn(window, 'print');

    render(<Kvittering kvittid='' />);

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    buttonTitle.click();

    expect(spy).toHaveBeenCalled();

    expect(buttonTitle).toBeInTheDocument();
  });

  it('renders full arbeidsgiverperiode text', () => {
    const spy = vi.spyOn(window, 'print');
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setPaakrevdeOpplysninger(Object.keys(forespoerselType) as Array<Opplysningstype>);
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering kvittid='' />);

    const textBlock = screen.getByText(/Arbeidsgiver er ansvarlig for/i);

    expect(textBlock).toBeInTheDocument();
  });

  it('renders without arbeidsgiverperiode text', () => {
    const spy = vi.spyOn(window, 'print');
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt, forespoerselType.refusjon]);
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering kvittid='' />);

    const textBlock = screen.queryByText(/Arbeidsgiver er ansvarlig for/i);

    expect(textBlock).not.toBeInTheDocument();
  });

  it('should have no violations', async () => {
    let container: string | Element;

    await act(async () => ({ container } = render(<Kvittering kvittid='' />)));

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
