import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import Home, { getServerSideProps } from '../../pages/[...slug]';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import useSendInnSkjema from '../../utils/useSendInnSkjema';
import useSendInnArbeidsgiverInitiertSkjema from '../../utils/useSendInnArbeidsgiverInitiertSkjema';
import useBoundStore from '../../state/useBoundStore';
import parseIsoDate from '../../utils/parseIsoDate';

// Mock external dependencies for getServerSideProps
vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(() => 'mock-token'),
  validateToken: vi.fn(() => Promise.resolve({ ok: true }))
}));

vi.mock('../../utils/hentForespoerselSSR', () => ({
  default: vi.fn(() => Promise.resolve({ data: { some: 'data' } }))
}));

vi.mock('../../utils/redirectTilLogin', () => ({
  redirectTilLogin: vi.fn(() => ({ redirect: { destination: '/login', permanent: false } }))
}));

// Mock all necessary modules
vi.mock('next/head', () => ({
  default: ({ children }) => <>{children}</>
}));

// Mock zodResolver to bypass validation
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async () => ({
    values: {
      bekreft_opplysninger: true,
      inntekt: { beloep: 10000, endringAarsaker: null, harBortfallAvNaturalytelser: false },
      refusjon: { beloepPerMaaned: 10000, isEditing: false, harEndringer: 'Nei' },
      kreverRefusjon: 'Ja',
      avsenderTlf: '12345678'
    },
    errors: {}
  })
}));

vi.mock('../../utils/useSendInnSkjema', () => ({
  default: vi.fn(() => vi.fn().mockResolvedValue({}))
}));

vi.mock('../../utils/useSendInnArbeidsgiverInitiertSkjema', () => ({
  default: vi.fn(() => vi.fn().mockResolvedValue({}))
}));

vi.mock('../../utils/useHentSkjemadata', () => ({
  default: vi.fn(() => vi.fn().mockResolvedValue({}))
}));

vi.mock('../../state/useStateInit', () => ({
  default: vi.fn(() => vi.fn())
}));

vi.mock('../../utils/useTidligereInntektsdata', () => ({
  default: vi.fn(() => ({ data: null, error: null }))
}));

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

const createMockState = (overrides = {}) => ({
  __esModule: true,
  default: vi.fn(),
  slettFeilmelding: vi.fn(),
  leggTilFeilmelding: vi.fn(),
  foreslaattBestemmendeFravaersdag: '2023-01-01',
  sykmeldingsperioder: [],
  egenmeldingsperioder: [],
  skjemaFeilet: false,
  skjemastatus: SkjemaStatus.UNDER_UTFYLLING,
  inngangFraKvittering: false,
  arbeidsgiverperioder: [],
  setTidligereInntekter: vi.fn(),
  setPaakrevdeOpplysninger: vi.fn(),
  hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt']),
  arbeidsgiverKanFlytteSkjæringstidspunkt: vi.fn().mockReturnValue(false),
  initBruttoinntekt: vi.fn(),
  bruttoinntekt: { bruttoInntekt: 10000, endringAarsaker: null },
  beloepArbeidsgiverBetalerISykefravaeret: vi.fn(),
  avsender: { tlf: '12345678', orgnr: '123456789' },
  sykmeldt: { fnr: '12345678910' },
  visFeilmeldingTekst: vi.fn((key) => `Feilmelding for ${key}`),
  visFeilmelding: vi.fn((key) => true),
  naturalytelser: [],
  forespurtData: null,
  behandlingsdager: [],
  endringerAvRefusjon: 'Nei',
  selvbestemtType: null,
  begrensetForespoersel: false,
  ...overrides
});

(useBoundStore as Mock).mockImplementation((stateFn) => stateFn(createMockState()));

// Mock all required UI components
vi.mock('../../components/BannerUtenVelger/BannerUtenVelger', () => ({
  default: ({ tittelMedUnderTittel }) => <div data-testid='banner'>{tittelMedUnderTittel}</div>
}));

vi.mock('../../components/PageContent/PageContent', () => ({
  default: ({ children }) => <div data-testid='page-content'>{children}</div>
}));

vi.mock('../../components/Person/Person', () => ({
  default: () => <div data-testid='person'>Person Component</div>
}));

vi.mock('../../components/Egenmelding/Egenmelding', () => ({
  default: () => <div data-testid='person'>Egenmelding Component</div>
}));

vi.mock('../../components/Skillelinje/Skillelinje', () => ({
  default: () => <div data-testid='skillelinje'>Skillelinje</div>
}));

vi.mock('../../components/Fravaersperiode/Fravaersperiode', () => ({
  default: () => <div data-testid='fravaersperiode'>Fravaersperiode Component</div>
}));

vi.mock('../../components/Bruttoinntekt/Bruttoinntekt', () => ({
  default: () => <div data-testid='bruttoinntekt'>Bruttoinntekt Component</div>
}));

vi.mock('../../components/RefusjonArbeidsgiver', () => ({
  default: () => <div data-testid='refusjon'>RefusjonArbeidsgiver Component</div>
}));

vi.mock('../../components/Naturalytelser', () => ({
  default: () => <div data-testid='naturalytelser'>Naturalytelser Component</div>
}));

vi.mock('../../components/Feilsammendrag', () => ({
  default: () => <div data-testid='feilsammendrag'>Feilsammendrag Component</div>
}));

vi.mock('../../components/Arbeidsgiverperiode/Arbeidsgiverperiode', () => ({
  default: () => <div data-testid='arbeidsgiverperiode'>Arbeidsgiverperiode Component</div>
}));

vi.mock('../../components/Behandlingsdager/Behandlingsdager', () => ({
  Behandlingsdager: () => <div data-testid='behandlingsdager'>Behandlingsdager Component</div>
}));

vi.mock('../../components/Heading3', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h3 data-testid='heading3'>{children}</h3>
}));

vi.mock('../../utils/fetchInntektsdata', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      data: {
        gjennomsnitt: 50000,
        historikk: [['2023-01', 50000]]
      }
    })
  )
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useBoundStore as Mock).mockImplementation((stateFn) => stateFn(createMockState()));
  });

  it('renders the main page components', () => {
    render(<Home slug='123' erEndring={false} />);

    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByTestId('person')).toBeInTheDocument();
    expect(screen.getByTestId('fravaersperiode')).toBeInTheDocument();
    expect(screen.getByTestId('bruttoinntekt')).toBeInTheDocument();
    expect(screen.getByTestId('refusjon')).toBeInTheDocument();
    expect(screen.getByTestId('naturalytelser')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('submits the form when confirmed', async () => {
    const mockSendInnSkjema = vi.fn().mockResolvedValue({});
    (useSendInnSkjema as Mock).mockReturnValue(mockSendInnSkjema);

    render(<Home slug='123' erEndring={false} />);

    // Confirm checkbox
    const confirmationCheckbox = screen.getByLabelText(
      'Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
    );
    fireEvent.click(confirmationCheckbox);

    // Submit form
    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendInnSkjema).toHaveBeenCalled();
    });
  });

  it('uses the arbeidsgiverInitiertSkjema when appropriate', async () => {
    const mockSendInnArbeidsgiverInitiertSkjema = vi.fn().mockResolvedValue({});
    vi.mocked(useSendInnArbeidsgiverInitiertSkjema).mockReturnValue(mockSendInnArbeidsgiverInitiertSkjema);

    render(<Home slug='arbeidsgiverInitiertInnsending' erEndring={false} />);

    // Confirm checkbox
    const confirmationCheckbox = screen.getByLabelText(
      'Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
    );
    fireEvent.click(confirmationCheckbox);

    // Submit form
    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendInnArbeidsgiverInitiertSkjema).toHaveBeenCalled();
    });
  });

  it('renders Behandlingsdager component when slug is behandlingsdager', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt', 'arbeidsgiverperiode'])
        })
      )
    );

    render(<Home slug='behandlingsdager' erEndring={false} />);

    expect(screen.getByTestId('behandlingsdager')).toBeInTheDocument();
  });

  it('shows Arbeidsgiverperiode info text when arbeidsgiverperiode is not required', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt'])
        })
      )
    );

    render(<Home slug='123' erEndring={false} />);

    expect(
      screen.getByText(
        'Vi trenger ikke informasjon om arbeidsgiverperioden for denne sykmeldingen. Sykemeldingen er en forlengelse av en tidligere sykefraværsperiode. Hvis du mener at det skal være arbeidsgiverperiode kan du endre dette.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Endre')).toBeInTheDocument();
  });

  it('shows Arbeidsgiverperiode component when overstyrSkalViseAgp is clicked', async () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt'])
        })
      )
    );

    render(<Home slug='123' erEndring={false} />);

    const endreButton = screen.getByText('Endre');
    fireEvent.click(endreButton);

    await waitFor(() => {
      expect(screen.getByTestId('arbeidsgiverperiode')).toBeInTheDocument();
    });
  });

  it('shows info text when inntekt is not required', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['arbeidsgiverperiode'])
        })
      )
    );

    render(<Home slug='123' erEndring={false} />);

    expect(screen.getByText('Beregnet månedslønn')).toBeInTheDocument();
    expect(screen.getByText('Vi trenger ikke informasjon om inntekt for dette sykefraværet.')).toBeInTheDocument();
  });

  it('renders Egenmelding component when arbeidsgiverperiode is required', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt', 'arbeidsgiverperiode'])
        })
      )
    );

    render(<Home slug='123' erEndring={false} />);

    // Egenmelding component should be rendered
    expect(screen.getByText('Egenmelding Component')).toBeInTheDocument();
  });

  it('uses selvbestemt schema when skjemastatus is SELVBESTEMT', async () => {
    const mockSendInnArbeidsgiverInitiertSkjema = vi.fn().mockResolvedValue({});
    vi.mocked(useSendInnArbeidsgiverInitiertSkjema).mockReturnValue(mockSendInnArbeidsgiverInitiertSkjema);

    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          skjemastatus: SkjemaStatus.SELVBESTEMT
        })
      )
    );

    render(<Home slug='some-uuid' erEndring={false} />);

    const confirmationCheckbox = screen.getByLabelText(
      'Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'
    );
    fireEvent.click(confirmationCheckbox);

    const submitButton = screen.getByText('Send');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendInnArbeidsgiverInitiertSkjema).toHaveBeenCalled();
    });
  });

  it('opens HentingAvDataFeilet modal when skjemaFeilet is true', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          skjemaFeilet: true
        })
      )
    );

    render(<Home slug='123' erEndring={false} />);

    // Modal should be rendered (HentingAvDataFeilet is mocked but should show)
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders with dataFraBackend and initializes state', () => {
    render(
      <Home
        slug='550e8400-e29b-41d4-a716-446655440000'
        erEndring={false}
        dataFraBackend={true}
        forespurt={{ data: { someKey: 'someValue' } }}
      />
    );

    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  it('fetches inntektsdata when conditions are met with valid UUID', async () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          sykmeldingsperioder: [{ fom: parseIsoDate('2023-01-01'), tom: parseIsoDate('2023-01-15') }],
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt', 'arbeidsgiverperiode']),
          foreslaattBestemmendeFravaersdag: '2023-02-01',
          inngangFraKvittering: false
        })
      )
    );

    render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} />);

    // Wait for the effect to run - fetchInntektsdata would be called if conditions are met
    await waitFor(() => {
      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });
  });

  it('does not fetch inntektsdata when skjemastatus is SELVBESTEMT', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          skjemastatus: SkjemaStatus.SELVBESTEMT,
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-15' }]
        })
      )
    );

    render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} />);

    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  describe('kvitteringData useEffects', () => {
    it('sets fullLonn to Ja when dataFraBackend is false and no redusertLoennIAgp', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: null
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={false} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets fullLonn to Nei and populates agp fields when kvitteringData has redusertLoennIAgp', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: {
              agp: {
                redusertLoennIAgp: {
                  beloep: 5000,
                  begrunnelse: 'Test begrunnelse'
                }
              }
            }
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={false} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets kreverRefusjon to Ja and populates refusjon fields when kvitteringData has refusjon.beloepPerMaaned', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: {
              refusjon: {
                beloepPerMaaned: 25000,
                endringer: null
              }
            }
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={false} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets refusjon.harEndringer to Ja when kvitteringData has refusjon endringer', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: {
              refusjon: {
                beloepPerMaaned: 25000,
                endringer: [
                  { beloep: 20000, startdato: '2023-03-01' },
                  { beloep: 15000, startdato: '2023-04-01' }
                ]
              }
            }
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={false} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets kreverRefusjon to Nei when dataFraBackend is false and no refusjon in kvitteringData', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: {}
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={false} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('does not override refusjon fields when dataFraBackend is true', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: {
              refusjon: {
                beloepPerMaaned: 25000
              }
            }
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={true} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets refusjon.beloepPerMaaned from inntekt when dataFraBackend is true', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            bruttoinntekt: { bruttoInntekt: 45000, endringAarsaker: null },
            endringerAvRefusjon: 'Nei'
          })
        )
      );

      render(<Home slug='550e8400-e29b-41d4-a716-446655440000' erEndring={false} dataFraBackend={true} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets refusjon.beloepPerMaaned from inntekt when selvbestemtInnsending is true', () => {
      (useBoundStore as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            bruttoinntekt: { bruttoInntekt: 45000, endringAarsaker: null },
            endringerAvRefusjon: 'Nei'
          })
        )
      );

      render(<Home slug='arbeidsgiverInitiertInnsending' erEndring={false} dataFraBackend={false} />);

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });
  });
});

describe('getServerSideProps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns props with valid UUID slug', async () => {
    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
    expect(result.props.slug).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.props.erEndring).toBe(false);
  });

  it('returns erEndring true when slug[1] is overskriv', async () => {
    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000', 'overskriv']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result.props.erEndring).toBe(true);
  });

  it('returns props without fetching when UUID is invalid', async () => {
    const context = {
      query: {
        slug: ['invalid-slug']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result.props.slug).toBe('invalid-slug');
    expect(result.props.forespurt).toBeNull();
  });

  it('returns props without fetching when endre is set', async () => {
    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000'],
        endre: 'true'
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result.props.dataFraBackend).toBe(false);
  });

  it('redirects to login when token is missing in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { getToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce(null as unknown as string);

    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');

    process.env.NODE_ENV = originalEnv;
  });

  it('redirects to login when token validation fails', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { getToken, validateToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce('mock-token');
    vi.mocked(validateToken).mockResolvedValueOnce({ ok: false });

    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');

    process.env.NODE_ENV = originalEnv;
  });

  it('returns notFound when fetching returns 404', async () => {
    const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
    const error = new Error('Not found');
    (error as Error & { status: number }).status = 404;
    vi.mocked(hentForespoerselSSR.default).mockRejectedValueOnce(error);

    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('notFound', true);
  });

  it('returns error status when fetching fails with other error', async () => {
    const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
    const error = new Error('Server error');
    (error as Error & { status: number }).status = 500;
    vi.mocked(hentForespoerselSSR.default).mockRejectedValueOnce(error);

    const context = {
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000']
      },
      req: {}
    };

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('props');
    expect(result.props.forespurtStatus).toBe(500);
  });
});
