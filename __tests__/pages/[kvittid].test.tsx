import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import Kvittering, { getServerSideProps } from '../../pages/kvittering/[kvittid]';

import env from '../../config/environment';
import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import forespoerselType from '../../config/forespoerselType';
import { Opplysningstype } from '../../schema/ForespurtDataSchema';

// Mock external dependencies
vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(() => 'mock-token'),
  validateToken: vi.fn(() => Promise.resolve({ ok: true }))
}));

vi.mock('../../utils/hentKvitteringsdataSSR', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      data: {
        kvitteringNavNo: {
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-15' }],
          skjema: {
            mottatt: '2023-01-20T10:00:00Z',
            inntekt: { beloep: 50000, inntektsdato: '2023-01-01' },
            agp: { perioder: [{ fom: '2023-01-01', tom: '2023-01-16' }] },
            refusjon: { beloepPerMaaned: 50000 }
          },
          avsender: { orgnr: '123456789', tlf: '12345678' },
          sykmeldt: { fnr: '12345678910', navn: 'Test Person' }
        }
      }
    })
  )
}));

vi.mock('../../utils/redirectTilLogin', () => ({
  redirectTilLogin: vi.fn(() => ({ redirect: { destination: '/login', permanent: false } }))
}));

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

  it('renders inntekt section when inntekt is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt]);
      result.current.initBruttoinntekt(50000, new Map(), new Date());
    });

    render(<Kvittering kvittid='' />);

    expect(screen.getByText(/Beregnet månedslønn/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrert inntekt/i)).toBeInTheDocument();
  });

  it('renders refusjon section when refusjon is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.refusjon]);
    });

    render(<Kvittering kvittid='' />);

    const refusjonHeadings = screen.getAllByText(/Refusjon/i);
    expect(refusjonHeadings.length).toBeGreaterThan(0);
  });

  it('renders naturalytelser section when inntekt is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt]);
    });

    render(<Kvittering kvittid='' />);

    const naturalytelserHeadings = screen.getAllByText(/Naturalytelser/i);
    expect(naturalytelserHeadings.length).toBeGreaterThan(0);
  });

  it('renders with dataFraBackend true', () => {
    const kvitteringData = {
      kvitteringNavNo: {
        sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-15' }],
        skjema: {
          mottatt: '2023-01-20T10:00:00Z',
          inntekt: { beloep: 50000, inntektsdato: '2023-01-01' },
          agp: { perioder: [{ fom: '2023-01-01', tom: '2023-01-16' }] },
          refusjon: { beloepPerMaaned: 50000 }
        },
        avsender: { orgnr: '123456789', tlf: '12345678' },
        sykmeldt: { fnr: '12345678910', navn: 'Test Person' }
      }
    };

    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([
        forespoerselType.inntekt,
        forespoerselType.arbeidsgiverperiode,
        forespoerselType.refusjon
      ]);
    });

    render(<Kvittering kvittid='test-uuid' kvittering={kvitteringData} dataFraBackend={true} />);

    const kvitteringHeadings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(kvitteringHeadings.length).toBeGreaterThan(0);
  });

  it('displays "Det er ikke arbeidsgiverperiode" when no valid arbeidsgiverperioder', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.arbeidsgiverperiode, forespoerselType.inntekt]);
      result.current.setArbeidsgiverperioder([]);
    });

    render(<Kvittering kvittid='' />);

    expect(screen.getByText(/Det er ikke arbeidsgiverperiode/i)).toBeInTheDocument();
  });

  it('renders FullLonnIArbeidsgiverperioden when arbeidsgiverperiode is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.arbeidsgiverperiode, forespoerselType.refusjon]);
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering kvittid='' />);

    expect(
      screen.getByText(/Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden/i)
    ).toBeInTheDocument();
  });

  it('navigates to edit page when clickEndre is called with valid UUID', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt]);
    });

    render(<Kvittering kvittid='550e8400-e29b-41d4-a716-446655440000' />);

    const endreButton = screen.getAllByText(/Endre/i)[0];
    endreButton.click();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/550e8400-e29b-41d4-a716-446655440000?endre=true');
    });
  });

  it('shows HentingAvDataFeilet modal when skjemaFeilet is true', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setSkjemaFeilet();
    });

    render(<Kvittering kvittid='' />);

    expect(screen.getByText(/Henting av kvitteringen feilet/i)).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  it('returns props in development mode', async () => {
    process.env.NODE_ENV = 'development';

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
    expect(result.props.kvittid).toBe('test-uuid');
  });

  it('returns props when fromSubmit is set in development', async () => {
    process.env.NODE_ENV = 'development';

    const context = {
      query: { kvittid: 'test-uuid', fromSubmit: 'true' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result.props.kvittering).toBeNull();
    expect(result.props.dataFraBackend).toBe(false);
  });

  it('returns notFound when 404 error in development', async () => {
    process.env.NODE_ENV = 'development';

    const hentKvitteringsdataSSR = await import('../../utils/hentKvitteringsdataSSR');
    const error = new Error('Not found');
    (error as Error & { status: number }).status = 404;
    vi.mocked(hentKvitteringsdataSSR.default).mockRejectedValueOnce(error);

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('notFound', true);
  });

  it('redirects to login when token is missing in production', async () => {
    process.env.NODE_ENV = 'production';

    const { getToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce(null as unknown as string);

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');
  });

  it('redirects to login when token validation fails in production', async () => {
    process.env.NODE_ENV = 'production';

    const { getToken, validateToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce('mock-token');
    vi.mocked(validateToken).mockResolvedValueOnce({ ok: false });

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');
  });

  it('returns props in production mode with valid token', async () => {
    process.env.NODE_ENV = 'production';

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
  });

  it('returns notFound when 404 error in production', async () => {
    process.env.NODE_ENV = 'production';

    const hentKvitteringsdataSSR = await import('../../utils/hentKvitteringsdataSSR');
    const error = new Error('Not found');
    (error as Error & { status: number }).status = 404;
    vi.mocked(hentKvitteringsdataSSR.default).mockRejectedValueOnce(error);

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('notFound', true);
  });

  it('returns props when fromSubmit is set in production', async () => {
    process.env.NODE_ENV = 'production';

    const context = {
      query: { kvittid: 'test-uuid', fromSubmit: 'true' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result.props.kvittering).toBeNull();
    expect(result.props.dataFraBackend).toBe(false);
  });
});
