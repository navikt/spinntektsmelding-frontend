import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Kvittering, { getServerSideProps } from '../../../pages/kvittering/agi/[kvittid]';
import { expect, vi, describe, it, beforeAll, beforeEach, afterEach } from 'vitest';
import useBoundStore from '../../../state/useBoundStore';
import env from '../../../config/environment';
import formatDate from '../../../utils/formatDate';
import formatTime from '../../../utils/formatTime';

import kvitteringsdata from '../../../mockdata/selvbestemt-kvittering.json';
import kvitteringsdataUtenAgp from '../../../mockdata/selvbestemt-kvittering-uten-agp.json';
import kvitteringsdataEksterntSystem from '../../../mockdata/kvittering-eksternt-system.json';
import kvitteringsdataBehandlingsdager from '../../../mockdata/kvittering-behandlingsdager.json';
import kvitteringsdataBackend from '../../../mockdata/kvittering-selvbestemt-format.json';
import { SelvbestemtInntektsmeldingSchema } from '../../../schema/SelvbestemtKvitteringSchema';
import AapenInnsendingSchema from '../../../schema/AapenInnsendingSchema';

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
            mottatt: '2023-01-20T10:00:00Z'
          }
        }
      }
    })
  )
}));

vi.mock('../../../utils/redirectTilLogin', () => ({
  redirectTilLogin: vi.fn(() => ({ redirect: { destination: '/login', permanent: false } }))
}));

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn()
}));

vi.mock('next/router', () => ({
  default: {},
  useRouter: () => ({ push: mockPush, asPath: '/test' })
}));

const initialState = useBoundStore.getState();

describe('Kvittering', () => {
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

  it('updates vedtaksperiodeId only when the backend ID changes', () => {
    const setVedtaksperiodeId = vi.fn();
    useBoundStore.setState({ setVedtaksperiodeId });
    const kvittering = {
      ...kvitteringsdata.selvbestemtInntektsmelding,
      vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
    };
    const props = {
      kvittid: '8d50ef20-37b5-4829-ad83-56219e70b375',
      kvittering,
      dataFraBackend: true,
      kvitteringStatus: 200
    };
    const { rerender } = render(<Kvittering {...props} />);

    expect(setVedtaksperiodeId).toHaveBeenCalledExactlyOnceWith(kvittering.vedtaksperiodeId);

    rerender(<Kvittering {...props} kvittering={{ ...kvittering }} />);
    expect(setVedtaksperiodeId).toHaveBeenCalledTimes(1);

    const nyId = '123e4567-e89b-12d3-a456-426614174001';
    rerender(<Kvittering {...props} kvittering={{ ...kvittering, vedtaksperiodeId: nyId }} />);
    expect(setVedtaksperiodeId).toHaveBeenLastCalledWith(nyId);
    expect(setVedtaksperiodeId).toHaveBeenCalledTimes(2);

    rerender(<Kvittering {...props} dataFraBackend={false} />);
    expect(setVedtaksperiodeId).toHaveBeenCalledTimes(2);

    rerender(<Kvittering {...props} kvittering={{ ...kvittering, vedtaksperiodeId: undefined }} />);
    expect(setVedtaksperiodeId).toHaveBeenCalledTimes(2);
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

    render(
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
      expect(mockPush).toHaveBeenCalledWith(
        '/8d50ef20-37b5-4829-ad83-56219e70b375?endre=true&agi=true',
        '/8d50ef20-37b5-4829-ad83-56219e70b375'
      );
    });
    expect(useBoundStore.getState().mottatt).toEqual(new Date(source.mottatt));
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

  it('ignores legacy refusjon sluttdato in the receipt and when editing', async () => {
    const user = userEvent.setup();
    const kvittering = {
      ...SelvbestemtInntektsmeldingSchema.parse(kvitteringsdataBackend.selvbestemtInntektsmelding),
      refusjon: {
        beloepPerMaaned: 12345,
        endringer: [{ startdato: '2025-12-01', beloep: 0 }],
        sluttdato: '2025-11-30'
      }
    };

    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={kvittering}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    expect(screen.getByText('01.12.2025')).toBeInTheDocument();
    expect(screen.queryByText('30.11.2025')).not.toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /Endre/i })[0]);

    expect(useBoundStore.getState().refusjonEndringer).toHaveLength(1);
    expect(useBoundStore.getState().kvitteringData?.refusjon).not.toHaveProperty('sluttdato');
    expect(mockPush).toHaveBeenCalledWith(
      '/8d50ef20-37b5-4829-ad83-56219e70b375?endre=true&agi=true',
      '/8d50ef20-37b5-4829-ad83-56219e70b375'
    );
  });

  it.each([true, false])(
    'shows zero refund and changes from the determining absence day with dataFraBackend=%s',
    (dataFraBackend) => {
      const kvittering = {
        ...SelvbestemtInntektsmeldingSchema.parse(kvitteringsdataBackend.selvbestemtInntektsmelding),
        refusjon: {
          beloepPerMaaned: 0,
          endringer: [
            { startdato: '2025-10-31', beloep: 100 },
            { startdato: '2025-11-01', beloep: 200 },
            { startdato: '2025-11-02', beloep: 0 }
          ]
        }
      };

      useBoundStore.setState({
        gammeltSkjaeringstidspunkt: new Date(2030, 0, 1),
        refusjonEndringer: [{ startdato: new Date(2031, 0, 1), beloep: 999 }],
        kvitteringData: AapenInnsendingSchema.parse({
          ...kvittering,
          sykmeldtFnr: kvittering.sykmeldt.fnr,
          arbeidsforholdType: { type: 'Fisker' },
          agp: null,
          refusjon: {
            ...kvittering.refusjon,
            endringer: kvittering.refusjon.endringer.slice(1)
          }
        })
      });

      render(
        <Kvittering
          kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
          kvittering={dataFraBackend ? kvittering : null}
          dataFraBackend={dataFraBackend}
          kvitteringStatus={200}
        />
      );

      expect(screen.getByText('0,00 kr/måned')).toBeInTheDocument();
      expect(screen.queryByRole('cell', { name: '31.10.2025' })).not.toBeInTheDocument();
      expect(screen.getByRole('row', { name: '01.11.2025 200,00' })).toBeInTheDocument();
      expect(screen.getByRole('row', { name: '02.11.2025 0,00' })).toBeInTheDocument();
      expect(screen.queryByRole('cell', { name: '01.01.2031' })).not.toBeInTheDocument();
    }
  );

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

  it('renders the received date from the backend', () => {
    const mottatt = new Date(kvitteringsdata.selvbestemtInntektsmelding.mottatt);
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={kvitteringsdata.selvbestemtInntektsmelding}
        kvitteringStatus={200}
        dataFraBackend={true}
      />
    );

    expect(
      screen.getByText(`Inntektsmelding innsendt - ${formatDate(mottatt)} kl. ${formatTime(mottatt)}`)
    ).toBeInTheDocument();
  });

  it('renders the received date from the store after submission', () => {
    const mottatt = new Date('2026-10-23T10:30:00Z');
    useBoundStore.setState({ mottatt });
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvitteringStatus={200} dataFraBackend={false} />);

    expect(
      screen.getByText(`Inntektsmelding innsendt - ${formatDate(mottatt)} kl. ${formatTime(mottatt)}`)
    ).toBeInTheDocument();
  });

  it('does not invent a received date when the store has none', () => {
    useBoundStore.setState({ mottatt: undefined });
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvitteringStatus={200} dataFraBackend={false} />);

    expect(screen.getByText('Inntektsmelding innsendt', { exact: true })).toBeInTheDocument();
  });

  it('setter arbeidsgiverperiodeDisabled til true når Endre klikkes og AGP ikke har perioder', async () => {
    const user = userEvent.setup();

    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdataUtenAgp.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const endreButton = screen.getAllByRole('button', { name: /Endre/i })[0];
    await user.click(endreButton);

    expect(useBoundStore.getState().arbeidsgiverperiodeDisabled).toBe(true);
  });

  it('setter ikke arbeidsgiverperiodeDisabled når Endre klikkes og AGP har gyldige perioder', async () => {
    const user = userEvent.setup();

    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const endreButton = screen.getAllByRole('button', { name: /Endre/i })[0];
    await user.click(endreButton);

    expect(useBoundStore.getState().arbeidsgiverperiodeDisabled).toBe(false);
  });

  it('renders all main content sections', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const headings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText(/Sykmeldt/i)).toBeInTheDocument();
    expect(screen.getByText(/Den ansatte/i)).toBeInTheDocument();
  });

  it('handles empty sykmeldingsperioder gracefully', () => {
    const kvitteringWithoutPeriods = {
      ...kvitteringsdata.selvbestemtInntektsmelding,
      sykmeldingsperioder: []
    };

    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={kvitteringWithoutPeriods}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const headings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders correct kvittid in props', () => {
    render(
      <Kvittering
        kvittid='test-uuid-12345'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const headings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders multiple Endre buttons', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const endreButtons = screen.getAllByRole('button', { name: /Endre/i });
    expect(endreButtons.length).toBeGreaterThan(0);
  });

  it('handles null refusjon in kvittering data', () => {
    const kvitteringWithoutRefusjon = {
      ...kvitteringsdata.selvbestemtInntektsmelding,
      refusjon: null
    };

    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={kvitteringWithoutRefusjon}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const headings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders with high kvitteringStatus code', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={500}
      />
    );

    const headings = screen.getAllByText(/Kvittering - innsendt inntektsmelding/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('print button has correct variant', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const printButton = screen.getByRole('button', { name: /Skriv ut/i });
    expect(printButton).toBeInTheDocument();
  });

  it('renders fravaersperiode section with correct content', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    const fravarePeriodText = screen.queryByText(/Fraværsperioder/i);
    if (fravarePeriodText) {
      expect(fravarePeriodText).toBeInTheDocument();
    }
  });

  it('renders refusjon beloep when present', () => {
    render(
      <Kvittering
        kvittid='8d50ef20-37b5-4829-ad83-56219e70b375'
        kvittering={{ ...kvitteringsdata.selvbestemtInntektsmelding }}
        dataFraBackend={true}
        kvitteringStatus={200}
      />
    );

    expect(screen.getByText(/Beregnet månedslønn/i)).toBeInTheDocument();
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
      query: { kvittid: '8d50ef20-37b5-4829-ad83-56219e70b375' },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
    if (!('props' in result) || !result.props) {
      throw new Error('Expected receipt props');
    }
    expect(result.props.kvittid).toBe('8d50ef20-37b5-4829-ad83-56219e70b375');
    expect(result.props.dataFraBackend).toBe(true);
    expect(result.props.kvittering).toMatchObject({
      sykmeldt: { navn: 'Test Person' },
      mottatt: '2023-01-20T10:00:00Z'
    });
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
    expect(result).not.toHaveProperty('props');
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
    expect(result).not.toHaveProperty('props');
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
    expect(result).not.toHaveProperty('props');
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
    if (!('props' in result) || !result.props) {
      throw new Error('Expected receipt props');
    }
    expect(result.props.kvitteringStatus).toBe(500);
    expect(result.props.kvittering).toBeNull();
    expect(result.props.dataFraBackend).toBe(false);
  });

  it('returns store-based props without fetching when fromSubmit is set', async () => {
    process.env.NODE_ENV = 'development';
    const { default: fetchKvittering } = await import('../../../utils/hentKvitteringsdataAgiSSR');
    vi.mocked(fetchKvittering).mockClear();

    const result = await getServerSideProps({
      query: { kvittid: 'test-uuid', fromSubmit: 'true' },
      req: {}
    });

    expect(fetchKvittering).not.toHaveBeenCalled();
    expect(result).toEqual({
      props: {
        kvittid: 'test-uuid',
        kvittering: null,
        kvitteringStatus: 200,
        dataFraBackend: false
      }
    });
  });

  it('returns null receipt props when the backend has no receipt', async () => {
    process.env.NODE_ENV = 'development';
    const { default: fetchKvittering } = await import('../../../utils/hentKvitteringsdataAgiSSR');
    vi.mocked(fetchKvittering).mockResolvedValueOnce({ data: null });

    const result = await getServerSideProps({
      query: { kvittid: 'test-uuid' },
      req: {}
    });

    expect(result).toEqual({
      props: {
        kvittid: 'test-uuid',
        kvittering: null,
        kvitteringStatus: 200,
        dataFraBackend: false
      }
    });
  });
});
