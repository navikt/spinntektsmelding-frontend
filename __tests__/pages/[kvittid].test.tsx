import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import Kvittering, { getServerSideProps } from '../../pages/kvittering/[kvittid]';

import env from '../../config/environment';
import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import forespoerselType from '../../config/forespoerselType';
import { Opplysningstype } from '../../schema/ForespurtDataSchema';
import FullInnsendingSchema from '../../schema/FullInnsendingSchema';
import { KvitteringNavNoSchema } from '../../schema/MottattKvitteringSchema';
import kvitteringsdataBackend from '../../mockdata/kvittering-selvbestemt-format.json';
import { serverSideContext } from '../utils/serverSideContext';
import type { MottattKvittering } from '../../state/useKvitteringInit';

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
          mottatt: '2023-01-20T10:00:00Z',
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-15' }],
          skjema: {
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

vi.mock('next/router', () => ({
  default: {},
  useRouter: () => ({ push: mockPush, asPath: '/test' })
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

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

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
        fom: new Date(2025, 4, 14),
        tom: new Date(2025, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setPaakrevdeOpplysninger(Object.keys(forespoerselType) as Array<Opplysningstype>);
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    const textBlock = screen.getByText(/Arbeidsgiver er ansvarlig for/i);

    expect(textBlock).toBeInTheDocument();
  });

  it('renders stored FAISU arbeidsforhold', () => {
    const source = kvitteringsdataBackend.selvbestemtInntektsmelding;
    const kvitteringData = FullInnsendingSchema.parse({
      ...source,
      forespoerselId: source.id,
      avsenderTlf: source.avsender.tlf,
      flereArbeidsforhold: {
        harLikLoenn: false,
        erSykmeldtFraAlle: false,
        arbeidsforhold: [
          { yrkesbeskrivelse: 'Utvikler', inntekt: 10000, stillingsprosent: 50, inkludertISykefravaer: true }
        ]
      }
    });
    useBoundStore.setState({ kvitteringData });

    render(<Kvittering kvittid={source.id} kvittering={null} dataFraBackend={false} kvitteringStatus={200} />);

    expect(screen.getByRole('columnheader', { name: 'Yrkestittel' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Utvikler' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /10\s*000/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '50 %' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ja' })).toBeInTheDocument();
  });

  it.each([{ flereArbeidsforhold: null }, { flereArbeidsforhold: undefined }])(
    'does not render FAISU when arbeidsforhold is $flereArbeidsforhold',
    ({ flereArbeidsforhold }) => {
      const source = kvitteringsdataBackend.selvbestemtInntektsmelding;
      const kvitteringData = FullInnsendingSchema.parse({
        ...source,
        forespoerselId: source.id,
        avsenderTlf: source.avsender.tlf,
        flereArbeidsforhold
      });
      useBoundStore.setState({ kvitteringData });

      render(<Kvittering kvittid={source.id} kvittering={null} dataFraBackend={false} kvitteringStatus={200} />);

      expect(screen.queryByRole('columnheader', { name: 'Yrkestittel' })).not.toBeInTheDocument();
    }
  );

  it('does not render FAISU for a normalized receipt without the field', () => {
    const source = kvitteringsdataBackend.selvbestemtInntektsmelding;
    const kvitteringData = KvitteringNavNoSchema.shape.skjema.parse(source);
    expect(kvitteringData).not.toHaveProperty('flereArbeidsforhold');
    useBoundStore.setState({ kvitteringData });

    render(<Kvittering kvittid={source.id} kvittering={null} dataFraBackend={false} kvitteringStatus={200} />);

    expect(screen.queryByRole('columnheader', { name: 'Yrkestittel' })).not.toBeInTheDocument();
  });

  it('does not render FAISU without receipt data', () => {
    useBoundStore.setState({ kvitteringData: undefined });

    render(<Kvittering kvittid='' kvittering={null} dataFraBackend={false} kvitteringStatus={200} />);

    expect(screen.queryByRole('columnheader', { name: 'Yrkestittel' })).not.toBeInTheDocument();
  });

  it('renders without arbeidsgiverperiode text', () => {
    const spy = vi.spyOn(window, 'print');
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2025, 4, 14),
        tom: new Date(2025, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt, forespoerselType.refusjon]);
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    const textBlock = screen.queryByText(/Arbeidsgiver er ansvarlig for/i);

    expect(textBlock).not.toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const { container } = await act(async () =>
      render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />)
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders inntekt section when inntekt is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt]);
      result.current.initBruttoinntekt(50000, {}, new Date());
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    expect(screen.getByText(/Beregnet månedslønn/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrert inntekt/i)).toBeInTheDocument();
  });

  it('renders refusjon section when refusjon is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.refusjon]);
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    const refusjonHeadings = screen.getAllByText(/Refusjon/i);
    expect(refusjonHeadings.length).toBeGreaterThan(0);
  });

  it('renders naturalytelser section when inntekt is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt]);
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

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

    render(
      <Kvittering
        kvittid='test-uuid'
        kvittering={kvitteringData as unknown as MottattKvittering}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const kvitteringHeadings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(kvitteringHeadings.length).toBeGreaterThan(0);
  });

  it('displays "Det er ikke arbeidsgiverperiode" when no valid arbeidsgiverperioder', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.arbeidsgiverperiode, forespoerselType.inntekt]);
      result.current.setArbeidsgiverperioder([]);
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    expect(screen.getByText(/Det er ikke arbeidsgiverperiode/i)).toBeInTheDocument();
  });

  it('renders FullLonnIArbeidsgiverperioden when arbeidsgiverperiode is requested', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2025, 4, 14),
        tom: new Date(2025, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.arbeidsgiverperiode, forespoerselType.refusjon]);
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    expect(
      screen.getByText(/Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden/i)
    ).toBeInTheDocument();
  });

  it('navigates to edit page when clickEndre is called with valid UUID', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setPaakrevdeOpplysninger([forespoerselType.inntekt]);
    });

    render(
      <Kvittering
        kvittid='550e8400-e29b-41d4-a716-446655440000'
        kvittering={null}
        kvitteringStatus={200}
        dataFraBackend={false}
      />
    );

    const endreButton = screen.getAllByText(/Endre/i)[0];
    endreButton.click();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledExactlyOnceWith(
        '/550e8400-e29b-41d4-a716-446655440000?endre=true',
        '/550e8400-e29b-41d4-a716-446655440000'
      );
    });
  });

  it('shows HentingAvDataFeilet modal when skjemaFeilet is true', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setSkjemaFeilet();
    });

    render(<Kvittering kvittid='' kvittering={null} kvitteringStatus={200} dataFraBackend={false} />);

    expect(screen.getByText(/Henting av kvitteringen feilet/i)).toBeInTheDocument();
  });

  it('setter arbeidsgiverperiodeDisabled til true når dataFraBackend er true og AGP ikke har perioder', async () => {
    const kvitteringData = {
      kvitteringNavNo: {
        sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-15' }],
        skjema: {
          mottatt: '2023-01-20T10:00:00Z',
          inntekt: { beloep: 50000, inntektsdato: '2023-01-01' },
          agp: { perioder: [] },
          refusjon: { beloepPerMaaned: 50000 }
        },
        avsender: { orgnr: '123456789', tlf: '12345678' },
        sykmeldt: { fnr: '12345678910', navn: 'Test Person' }
      }
    };

    await act(async () => {
      render(
        <Kvittering
          kvittid='test-uuid'
          kvittering={kvitteringData as unknown as MottattKvittering}
          dataFraBackend={true}
          kvitteringStatus={200}
        />
      );
    });

    expect(useBoundStore.getState().arbeidsgiverperiodeDisabled).toBe(true);
  });

  it('setter ikke arbeidsgiverperiodeDisabled når dataFraBackend er true og AGP har gyldige perioder', async () => {
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

    await act(async () => {
      render(
        <Kvittering
          kvittid='test-uuid'
          kvittering={kvitteringData as unknown as MottattKvittering}
          dataFraBackend={true}
          kvitteringStatus={200}
        />
      );
    });

    expect(useBoundStore.getState().arbeidsgiverperiodeDisabled).toBe(false);
  });
});

describe('getServerSideProps', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', originalEnv);
  });

  it('returns props in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const context = serverSideContext({ kvittid: 'test-uuid' });

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected receipt props');

    expect(result).toHaveProperty('props');
    expect(result.props.kvittid).toBe('test-uuid');
  });

  it('returns props when fromSubmit is set in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const context = serverSideContext({ kvittid: 'test-uuid', fromSubmit: 'true' });

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected receipt props');

    expect(result.props.kvittering).toBeNull();
    expect(result.props.dataFraBackend).toBe(false);
  });

  it('returns notFound when 404 error in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const hentKvitteringsdataSSR = await import('../../utils/hentKvitteringsdataSSR');
    const error = new Error('Not found');
    (error as Error & { status: number }).status = 404;
    vi.mocked(hentKvitteringsdataSSR.default).mockRejectedValueOnce(error);

    const context = serverSideContext({ kvittid: 'test-uuid' });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('notFound', true);
  });

  it('redirects to login when token is missing in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { getToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce(null as unknown as string);

    const context = serverSideContext({ kvittid: 'test-uuid' });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');
  });

  it('redirects to login when token validation fails in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { getToken, validateToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce('mock-token');
    vi.mocked(validateToken, { partial: true }).mockResolvedValueOnce({ ok: false });

    const context = serverSideContext({ kvittid: 'test-uuid' });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');
  });

  it('returns props in production mode with valid token', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const context = serverSideContext({ kvittid: 'test-uuid' });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
  });

  it('returns notFound when 404 error in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const hentKvitteringsdataSSR = await import('../../utils/hentKvitteringsdataSSR');
    const error = new Error('Not found');
    (error as Error & { status: number }).status = 404;
    vi.mocked(hentKvitteringsdataSSR.default).mockRejectedValueOnce(error);

    const context = serverSideContext({ kvittid: 'test-uuid' });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('notFound', true);
  });

  it('returns props when fromSubmit is set in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const context = serverSideContext({ kvittid: 'test-uuid', fromSubmit: 'true' });

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected receipt props');

    expect(result.props.kvittering).toBeNull();
    expect(result.props.dataFraBackend).toBe(false);
  });
});
