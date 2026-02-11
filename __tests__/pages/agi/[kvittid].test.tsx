import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Kvittering, { getServerSideProps } from '../../../pages/kvittering/agi/[kvittid]';
import { expect, vi, describe, it, beforeAll, beforeEach, afterEach } from 'vitest';
import useBoundStore from '../../../state/useBoundStore';
import env from '../../../config/environment';

import kvitteringsdata from '../../../mockdata/selvbestemt-kvittering.json';
import kvitteringsdataUtenAgp from '../../../mockdata/selvbestemt-kvittering-uten-agp.json';
import kvitteringsdataEksterntSystem from '../../../mockdata/kvittering-eksternt-system.json';
import kvitteringsdataBehandlingsdager from '../../../mockdata/kvittering-behandlingsdager.json';

// Mock external dependencies for getServerSideProps
vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(() => 'mock-token'),
  validateToken: vi.fn(() => Promise.resolve({ ok: true }))
}));

vi.mock('../../../utils/hentKvitteringsdataAgiSSR', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      data: {
        success: {
          selvbestemtInntektsmelding: {
            sykmeldt: { navn: 'Test Person', fnr: '12345678910' },
            avsender: { orgnr: '123456789', orgNavn: 'Test Org', navn: 'Avsender', tlf: '12345678' },
            sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-15' }],
            agp: { perioder: [], egenmeldinger: [] },
            inntekt: { beloep: 50000, inntektsdato: '2023-01-01' },
            refusjon: { beloepPerMaaned: 50000 },
            tidspunkt: '2023-01-20T10:00:00Z'
          }
        }
      }
    })
  )
}));

vi.mock('../../../utils/redirectTilLogin', () => ({
  redirectTilLogin: vi.fn(() => ({ redirect: { destination: '/login', permanent: false } }))
}));

const { mockPush, mockGet } = vi.hoisted(() => ({
  mockPush: vi.fn((url) => console.log('mockPush called with:', url)),
  mockGet: vi.fn()
}));

vi.mock('next/navigation', () => ({
  default: {},
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet })
}));

const initialState = useBoundStore.getState();

describe('Kvittering', () => {
  beforeAll(() => {
    // Log uncaught exceptions for debugging
    process.on('uncaughtException', (err) => {
      console.error('!!! Uncaught exception:', err?.message, err);
    });
    process.on('unhandledRejection', (err: any) => {
      console.error('!!! Unhandled rejection:', err?.message, err);
    });
  });

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
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });

  it('renders full arbeidsgiverperiode text', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const textBlock = screen.getByText(/Arbeidsgiverperiode/);

    expect(textBlock).toBeInTheDocument();
  });

  it('renders without arbeidsgiverperiode text', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdataUtenAgp.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const textBlock = screen.queryByText(/Det er ikke arbeidsgiverperiode./);

    expect(textBlock).toBeInTheDocument();
  });

  it.skip('renders without kvittering fra eksternt system', () => {
    // Skal aldri komme fra eksternt system på dette endepunktet
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdataEksterntSystem }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const textBlock = screen.getByText(/AR123456/i);

    expect(textBlock).toBeInTheDocument();
  });
  it('renders without behandlingsdager', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdataBehandlingsdager.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const textBlock = screen.queryAllByText('Fra');

    expect(textBlock).toHaveLength(13);
  });

  it('renders print button and triggers print', () => {
    const printSpy = vi.spyOn(window, 'print');

    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const printButton = screen.getByRole('button', { name: /Skriv ut/i });
    printButton.click();

    expect(printSpy).toHaveBeenCalled();
  });

  it('renders Endre button and navigates on click', async () => {
    const user = userEvent.setup();

    // Create a completely fresh and mutable copy of the mock data
    const source = kvitteringsdata.selvbestemtInntektsmelding;
    const kvitteringData = {
      ...source,
      sykmeldt: { ...source.sykmeldt },
      avsender: { ...source.avsender },
      sykmeldingsperioder: source.sykmeldingsperioder.map((p) => ({ ...p })),
      agp: source.agp
        ? {
            ...source.agp,
            perioder: source.agp.perioder?.map((p) => ({ ...p })) ?? [],
            egenmeldinger: source.agp.egenmeldinger?.map((e) => ({ ...e })) ?? [],
            redusertLoennIAgp: source.agp.redusertLoennIAgp ? { ...source.agp.redusertLoennIAgp } : null
          }
        : null,
      inntekt: { ...source.inntekt },
      refusjon: source.refusjon
        ? {
            ...source.refusjon,
            endringer: source.refusjon.endringer?.map((e) => ({ ...e })) ?? []
          }
        : null
    };

    const { container } = render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={kvitteringData}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const endreButton = screen.getAllByRole('button', { name: /Endre/i })[0];
    expect(endreButton).toBeInTheDocument();

    await user.click(endreButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/8d50ef20-37b5-4829-ad83-56219e70b375?endre=true');
    });
  });

  it('renders refusjon section', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const refusjonHeadings = screen.getAllByText(/Refusjon/i);
    expect(refusjonHeadings.length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden/i)
    ).toBeInTheDocument();
  });

  it('renders naturalytelser section', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    expect(screen.getByText(/Eventuelle naturalytelser/i)).toBeInTheDocument();
  });

  it('renders beregnet månedslønn section', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    expect(screen.getByText(/Beregnet månedslønn/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrert inntekt/i)).toBeInTheDocument();
  });

  it('renders bestemmende fraværsdag section', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const headings = screen.getAllByText(/Bestemmende fraværsdag/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/angir den dato som sykelønn skal beregnes utfra/i)).toBeInTheDocument();
  });

  it('renders person data from kvittering', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    // PersonVisning component should be rendered
    const kvitteringHeadings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(kvitteringHeadings.length).toBeGreaterThan(0);
  });

  it('renders without dataFraBackend - uses store data', () => {
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvitteringStatus={200} dataFraBackend={false} />);

    // Should still render the page structure
    const kvitteringHeadings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(kvitteringHeadings.length).toBeGreaterThan(0);
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
    const hentKvitteringsdataAgiSSR = await import('../../../utils/hentKvitteringsdataAgiSSR');
    const context = {
      query: { kvittid: '8d50ef20-37b5-4829-ad83-56219e70b375' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
    expect(result.props.kvittid).toBe('8d50ef20-37b5-4829-ad83-56219e70b375');
    expect(result.props.dataFraBackend).toBe(true);
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

    const hentKvitteringsdataAgiSSR = await import('../../../utils/hentKvitteringsdataAgiSSR');
    const error = new Error('Not found');
    (error as Error & { status: number }).status = 404;
    vi.mocked(hentKvitteringsdataAgiSSR.default).mockRejectedValueOnce(error);

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('notFound', true);
  });

  it('returns error status when fetching fails with other error', async () => {
    process.env.NODE_ENV = 'production';

    const hentKvitteringsdataAgiSSR = await import('../../../utils/hentKvitteringsdataAgiSSR');
    const error = new Error('Server error');
    (error as Error & { status: number }).status = 500;
    vi.mocked(hentKvitteringsdataAgiSSR.default).mockRejectedValueOnce(error);

    const context = {
      query: { kvittid: 'test-uuid' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
    expect(result.props.kvitteringStatus).toBe(500);
  });
});
