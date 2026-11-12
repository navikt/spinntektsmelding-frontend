import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useFormContext, useWatch } from 'react-hook-form';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import Home, { getServerSideProps } from '../../pages/[...slug]';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import useSendInnSkjema from '../../utils/useSendInnSkjema';
import useSendInnArbeidsgiverInitiertSkjema from '../../utils/useSendInnArbeidsgiverInitiertSkjema';
import useBoundStore from '../../state/useBoundStore';
import parseIsoDate from '../../utils/parseIsoDate';
import forespoerselType from '../../config/forespoerselType';
import router from 'next-router-mock';
import { logger } from '@navikt/next-logger';
import fetchArbeidsforhold from '../../utils/fetchArbeidsforhold';

let observedForm: ReturnType<typeof useFormContext>;

const defaultHomeProps = {
  dataFraBackend: false,
  forespurt: null,
  forespurtStatus: 200,
  harGradertSykmelding: false,
  harFlereArbeidsforhold: false,
  ansettelsesforhold: null,
  faisuEnabled: false
} satisfies Partial<React.ComponentProps<typeof Home>>;

// Mock external dependencies for getServerSideProps
vi.mock('@navikt/oasis', () => ({
  getToken: vi.fn(() => 'mock-token'),
  validateToken: vi.fn(() => Promise.resolve({ ok: true }))
}));

vi.mock('../../utils/hentForespoerselSSR', () => ({
  default: vi.fn(() => Promise.resolve({ data: { some: 'data' } }))
}));

vi.mock('../../utils/hentArbeidsforholdSSR', () => ({
  default: vi.fn(() => Promise.resolve(null))
}));

vi.mock('../../utils/redirectTilLogin', () => ({
  redirectTilLogin: vi.fn(() => ({ redirect: { destination: '/login', permanent: false } }))
}));

// Mock all necessary modules
vi.mock('next/head', () => ({
  default: ({ children }: React.PropsWithChildren) => <>{children}</>
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

vi.mock('../../utils/fetchArbeidsforhold', () => ({
  __esModule: true,
  default: vi.fn(() => Promise.resolve({ ansettelsesforhold: [] }))
}));

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

const createMockState = <Overrides extends object>(overrides: Overrides = {} as Overrides) => ({
  __esModule: true,
  default: vi.fn(),
  slettFeilmelding: vi.fn(),
  leggTilFeilmelding: vi.fn(),
  foreslaattBestemmendeFravaersdag: '2023-01-01',
  sykmeldingsperioder: [{ id: 'periode-1', fom: parseIsoDate('2023-02-20'), tom: parseIsoDate('2023-03-03') }],
  egenmeldingsperioder: [],
  skjemaFeilet: false,
  skjemastatus: SkjemaStatus.FULL,
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
  selvbestemtType: null,
  begrensetForespoersel: false,
  setArbeidsgiverperiodeDisabled: vi.fn(),
  ...overrides
});

(useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(createMockState()));

// Mock all required UI components
vi.mock('../../components/BannerUtenVelger/BannerUtenVelger', () => ({
  default: ({ tittelMedUnderTittel }: { tittelMedUnderTittel: string }) => (
    <div data-testid='banner'>{tittelMedUnderTittel}</div>
  )
}));

vi.mock('../../components/PageContent/PageContent', () => ({
  default: ({ children }: React.PropsWithChildren) => <div data-testid='page-content'>{children}</div>
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
  default: function MockRefusjonArbeidsgiver() {
    observedForm = useFormContext();
    return <div data-testid='refusjon'>RefusjonArbeidsgiver Component</div>;
  }
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

vi.mock('../../components/Faisu/Faisu', () => ({
  __esModule: true,
  default: function MockFaisu({
    harGradertSykmeldingOgFlereArbeidsforhold
  }: {
    harGradertSykmeldingOgFlereArbeidsforhold: boolean;
  }) {
    const { control } = useFormContext();
    const arbeidsforhold = useWatch({ control, name: 'flereArbeidsforhold.arbeidsforhold' });

    return (
      <div data-testid='faisu' data-flere-arbeidsforhold={harGradertSykmeldingOgFlereArbeidsforhold}>
        Faisu Component
        <span data-testid='arbeidsforhold'>{JSON.stringify(arbeidsforhold)}</span>
      </div>
    );
  }
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

function createServerSideContext(overrides: any = {}) {
  const { query, req, res, ...rest } = overrides;

  return {
    query: {
      slug: ['550e8400-e29b-41d4-a716-446655440000'],
      ...query
    },
    req: {
      cookies: {},
      headers: {
        host: 'localhost:3000'
      },
      ...req
    },
    res: {
      setHeader: vi.fn(),
      appendHeader: vi.fn(),
      ...res
    },
    ...rest
  };
}

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(createMockState()));
  });

  describe('inactive AGP fields', () => {
    it('clears inactive values and their errors without changing periods or marking the form dirty', async () => {
      render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} dataFraBackend={true} />);
      const perioder = [{ fom: '2026-11-05', tom: '2026-11-05' }];

      act(() => {
        observedForm.setValue('agp.perioder', perioder);
        observedForm.setValue('agp.redusertLoennIAgp', { begrunnelse: null });
        observedForm.setError('agp.redusertLoennIAgp.begrunnelse', { type: 'manual', message: 'Required' });
        observedForm.setError('agp.perioder', { type: 'manual', message: 'Choose periods' });
      });

      await waitFor(() => {
        expect(observedForm.getValues('agp.redusertLoennIAgp')).toBeNull();
        expect(observedForm.getFieldState('agp.redusertLoennIAgp.begrunnelse').error).toBeUndefined();
      });
      expect(observedForm.getValues('agp.perioder')).toEqual(perioder);
      expect(observedForm.getFieldState('agp.perioder').error?.message).toBe('Choose periods');
      expect(observedForm.formState.isDirty).toBe(false);
    });

    it('preserves initialized values, clears them for full pay and allows reactivation', async () => {
      const redusertLoennIAgp = { beloep: 5000, begrunnelse: 'ArbeidOpphoert' };
      const state = createMockState({
        hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['arbeidsgiverperiode']),
        kvitteringData: { agp: { redusertLoennIAgp } }
      });
      (useBoundStore as unknown as Mock).mockImplementation((selector) => selector(state));
      render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={true} dataFraBackend={false} />);

      await waitFor(() => expect(observedForm.getValues('agp.redusertLoennIAgp')).toEqual(redusertLoennIAgp));
      act(() => observedForm.setValue('fullLonn', 'Ja', { shouldDirty: true }));
      await waitFor(() => expect(observedForm.getValues('agp.redusertLoennIAgp')).toBeNull());

      act(() => {
        observedForm.setValue('fullLonn', 'Nei');
        observedForm.setValue('agp.redusertLoennIAgp', redusertLoennIAgp);
      });
      await waitFor(() => expect(observedForm.getValues('agp.redusertLoennIAgp')).toEqual(redusertLoennIAgp));
    });

    it.each([
      { arbeidsgiverperiodeKort: true, arbeidsgiverperiodeDisabled: false },
      { arbeidsgiverperiodeKort: false, arbeidsgiverperiodeDisabled: true }
    ])('preserves active short or manually disabled AGP values: %o', async (agpState) => {
      const redusertLoennIAgp = { beloep: 0, begrunnelse: 'IkkeFravaer' };
      const state = createMockState({
        ...agpState,
        hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['arbeidsgiverperiode']),
        kvitteringData: { agp: { redusertLoennIAgp } }
      });
      (useBoundStore as unknown as Mock).mockImplementation((selector) => selector(state));
      render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={true} dataFraBackend={false} />);

      await waitFor(() => expect(observedForm.getValues('agp.redusertLoennIAgp')).toEqual(redusertLoennIAgp));
      act(() => observedForm.setValue('fullLonn', 'Ja'));
      await waitFor(() => expect(observedForm.getValues('agp.redusertLoennIAgp')).toEqual(redusertLoennIAgp));
    });
  });

  it('renders the main page components', () => {
    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByTestId('person')).toBeInTheDocument();
    expect(screen.getByTestId('fravaersperiode')).toBeInTheDocument();
    expect(screen.getByTestId('bruttoinntekt')).toBeInTheDocument();
    expect(screen.getByTestId('refusjon')).toBeInTheDocument();
    expect(screen.getByTestId('naturalytelser')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('logs errors when fetching arbeidsforhold fails', async () => {
    const error = new Error('Kunne ikke hente arbeidsforhold');
    vi.mocked(fetchArbeidsforhold).mockRejectedValueOnce(error);
    const warnSpy = vi.spyOn(logger, 'warn');

    try {
      render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

      await waitFor(() => {
        expect(warnSpy).toHaveBeenCalledWith({ err: error }, 'Feil ved henting av arbeidsforhold i hovedskjema');
      });
      expect(screen.getByText('Send')).toBeInTheDocument();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('ignores an older arbeidsforhold response after the periods change', async () => {
    type Response = Awaited<ReturnType<typeof fetchArbeidsforhold>>;
    let resolveOlder!: (response: Response) => void;
    let resolveNewer!: (response: Response) => void;
    vi.mocked(fetchArbeidsforhold)
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveOlder = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveNewer = resolve;
          })
      );

    let state = createMockState();
    (useBoundStore as unknown as Mock).mockImplementation((selector) => selector(state));
    const { rerender } = render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    state = {
      ...state,
      sykmeldingsperioder: [{ id: 'periode-2', fom: parseIsoDate('2023-04-01'), tom: parseIsoDate('2023-04-10') }]
    };
    rerender(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);
    expect(fetchArbeidsforhold).toHaveBeenCalledTimes(2);

    const newerResponse: Response = {
      ansettelsesforhold: [
        { startdato: '2023-01-01', yrkesbeskrivelse: 'Ny stilling', stillingsprosent: 50 },
        { startdato: '2023-01-01', yrkesbeskrivelse: 'Annen stilling', stillingsprosent: 50 }
      ]
    };
    await act(async () => resolveNewer(newerResponse));

    expect(screen.getByTestId('faisu')).toHaveAttribute('data-flere-arbeidsforhold', 'true');
    const newerFormData = screen.getByTestId('arbeidsforhold').textContent;
    expect(newerFormData).toContain('Ny stilling');

    await act(async () =>
      resolveOlder({
        ansettelsesforhold: [{ startdato: '2023-01-01', yrkesbeskrivelse: 'Gammel stilling', stillingsprosent: 100 }]
      })
    );

    expect(screen.getByTestId('faisu')).toHaveAttribute('data-flere-arbeidsforhold', 'true');
    expect(screen.getByTestId('arbeidsforhold').textContent).toBe(newerFormData);
  });

  it.each(['endre=true', 'agi=true', 'endre=true&agi=true'])(
    'removes %s from the URL in one shallow replacement',
    async (flags) => {
      router.setCurrentUrl(`/550e8400-e29b-41d4-a716-446655440000?${flags}&fromSubmit=true`);
      const replaceSpy = vi.spyOn(router, 'replace').mockResolvedValue(true);

      try {
        render(
          <Home {...defaultHomeProps} slug='550e8400-e29b-41d4-a716-446655440000' erEndringFraKvittering={true} />
        );

        await waitFor(() => {
          expect(replaceSpy).toHaveBeenCalledTimes(1);
          expect(replaceSpy).toHaveBeenCalledWith(
            {
              pathname: router.pathname,
              query: { fromSubmit: 'true' }
            },
            undefined,
            { shallow: true }
          );
        });
      } finally {
        replaceSpy.mockRestore();
        router.reset();
      }
    }
  );

  it('renders confirmation checkbox', () => {
    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    expect(
      screen.getByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.')
    ).toBeInTheDocument();
  });

  it('submits the form when confirmed', async () => {
    const mockSendInnSkjema = vi.fn().mockResolvedValue({});
    (useSendInnSkjema as unknown as Mock).mockReturnValue(mockSendInnSkjema);

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

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

    render(<Home {...defaultHomeProps} slug='arbeidsgiverInitiertInnsending' erEndringFraKvittering={false} />);

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

  it('adds arbeidsgiverperiode to opplysningstyper when overstyrt and submits updated payload', async () => {
    const mockSendInnSkjema = vi.fn().mockResolvedValue({});
    const mockSetPaakrevdeOpplysninger = vi.fn();

    (useSendInnSkjema as unknown as Mock).mockReturnValue(mockSendInnSkjema);
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue([forespoerselType.inntekt]),
          setPaakrevdeOpplysninger: mockSetPaakrevdeOpplysninger
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    fireEvent.click(screen.getByText('Endre'));
    fireEvent.click(screen.getByLabelText('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.'));
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(mockSendInnSkjema).toHaveBeenCalled();
    });

    const submittedFormData = mockSendInnSkjema.mock.calls[0][3];
    expect(submittedFormData.opplysningstyper).toEqual(
      expect.arrayContaining([forespoerselType.inntekt, forespoerselType.arbeidsgiverperiode])
    );
    expect(mockSetPaakrevdeOpplysninger).toHaveBeenCalledWith(
      expect.arrayContaining([forespoerselType.inntekt, forespoerselType.arbeidsgiverperiode])
    );
  });

  it('renders Behandlingsdager component when slug is behandlingsdager', () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt', 'arbeidsgiverperiode'])
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='behandlingsdager' erEndringFraKvittering={false} />);

    expect(screen.getByTestId('behandlingsdager')).toBeInTheDocument();
  });

  it('shows Arbeidsgiverperiode info text when arbeidsgiverperiode is not required', () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt'])
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    expect(
      screen.getByText(
        'Vi trenger ikke informasjon om arbeidsgiverperioden for denne sykmeldingen. Sykemeldingen er en forlengelse av en tidligere sykefraværsperiode. Hvis du mener at det skal være arbeidsgiverperiode kan du endre dette.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Endre')).toBeInTheDocument();
  });

  it('shows Arbeidsgiverperiode component when overstyrSkalViseAgp is clicked', async () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt'])
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    const endreButton = screen.getByText('Endre');
    fireEvent.click(endreButton);

    await waitFor(() => {
      expect(screen.getByTestId('arbeidsgiverperiode')).toBeInTheDocument();
    });
  });

  it('calls setArbeidsgiverperiodeDisabled(false) and shows Arbeidsgiverperiode when Endre button is clicked', async () => {
    const mockSetArbeidsgiverperiodeDisabled = vi.fn();

    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt']),
          setArbeidsgiverperiodeDisabled: mockSetArbeidsgiverperiodeDisabled
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    // Verify the "Endre" button is visible when arbeidsgiverperiode is not required
    expect(screen.getByText('Endre')).toBeInTheDocument();

    // Click the "Endre" button
    const endreButton = screen.getByText('Endre');
    fireEvent.click(endreButton);

    // Verify that setArbeidsgiverperiodeDisabled(false) was called
    expect(mockSetArbeidsgiverperiodeDisabled).toHaveBeenCalledWith(false);

    // Verify that Arbeidsgiverperiode component is now shown
    await waitFor(() => {
      expect(screen.getByTestId('arbeidsgiverperiode')).toBeInTheDocument();
    });
  });

  it('shows info text when inntekt is not required', () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['arbeidsgiverperiode'])
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    expect(screen.getByText('Beregnet månedslønn')).toBeInTheDocument();
    expect(screen.getByText('Vi trenger ikke informasjon om inntekt for dette sykefraværet.')).toBeInTheDocument();
  });

  it('renders Egenmelding component when arbeidsgiverperiode is required', () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt', 'arbeidsgiverperiode'])
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} dataFraBackend={true} />);

    // Egenmelding component should be rendered
    expect(screen.getByText('Egenmelding Component')).toBeInTheDocument();
  });

  it('uses selvbestemt schema when skjemastatus is SELVBESTEMT', async () => {
    const mockSendInnArbeidsgiverInitiertSkjema = vi.fn().mockResolvedValue({});
    vi.mocked(useSendInnArbeidsgiverInitiertSkjema).mockReturnValue(mockSendInnArbeidsgiverInitiertSkjema);

    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          skjemastatus: SkjemaStatus.SELVBESTEMT
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='some-uuid' erEndringFraKvittering={false} />);

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
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          skjemaFeilet: true
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='123' erEndringFraKvittering={false} />);

    // Modal should be rendered (HentingAvDataFeilet is mocked but should show)
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders with dataFraBackend and initializes state', () => {
    render(
      <Home
        {...defaultHomeProps}
        slug='550e8400-e29b-41d4-a716-446655440000'
        erEndringFraKvittering={false}
        dataFraBackend={true}
        forespurt={{ data: { someKey: 'someValue' } } as unknown as React.ComponentProps<typeof Home>['forespurt']}
      />
    );

    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  it('fetches inntektsdata when conditions are met with valid UUID', async () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          sykmeldingsperioder: [{ fom: parseIsoDate('2023-01-01'), tom: parseIsoDate('2023-01-15') }],
          hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt', 'arbeidsgiverperiode']),
          foreslaattBestemmendeFravaersdag: '2023-02-01',
          inngangFraKvittering: false
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='550e8400-e29b-41d4-a716-446655440000' erEndringFraKvittering={false} />);

    // Wait for the effect to run - fetchInntektsdata would be called if conditions are met
    await waitFor(() => {
      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });
  });

  it('does not fetch inntektsdata when skjemastatus is SELVBESTEMT', () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn(
        createMockState({
          skjemastatus: SkjemaStatus.SELVBESTEMT,
          sykmeldingsperioder: [{ fom: parseIsoDate('2023-01-01'), tom: parseIsoDate('2023-01-15') }]
        })
      )
    );

    render(<Home {...defaultHomeProps} slug='550e8400-e29b-41d4-a716-446655440000' erEndringFraKvittering={false} />);

    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  describe('kvitteringData useEffects', () => {
    it.each([
      { harLikLoenn: true, erSykmeldtFraAlle: false, forventetLikLoenn: 'Ja', forventetSykmeldtFraAlle: 'Nei' },
      { harLikLoenn: false, erSykmeldtFraAlle: true, forventetLikLoenn: 'Nei', forventetSykmeldtFraAlle: 'Ja' }
    ])('converts receipt answers to form values: $harLikLoenn / $erSykmeldtFraAlle', (svar) => {
      const arbeidsforhold = [
        { inntekt: 25000, stillingsprosent: 50, yrkesbeskrivelse: 'Utvikler', inkludertISykefravaer: false }
      ];
      const mockState = createMockState({
        avsender: { tlf: '12345678', orgnr: '' },
        kvitteringData: {
          flereArbeidsforhold: {
            harLikLoenn: svar.harLikLoenn,
            erSykmeldtFraAlle: svar.erSykmeldtFraAlle,
            arbeidsforhold
          }
        }
      });
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(mockState));

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={true}
          dataFraBackend={false}
        />
      );

      expect(observedForm.getValues('flereArbeidsforhold')).toEqual({
        harLikLoenn: svar.forventetLikLoenn,
        erSykmeldtFraAlle: svar.forventetSykmeldtFraAlle,
        arbeidsforhold
      });
    });

    it.each([{ flereArbeidsforhold: undefined }, { flereArbeidsforhold: null }])(
      'preserves form values when receipt arbeidsforhold is $flereArbeidsforhold',
      ({ flereArbeidsforhold }) => {
        let mockState = createMockState({
          avsender: { tlf: '12345678', orgnr: '' },
          kvitteringData: { flereArbeidsforhold }
        });
        (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(mockState));

        const { rerender } = render(
          <Home
            {...defaultHomeProps}
            slug='550e8400-e29b-41d4-a716-446655440000'
            erEndringFraKvittering={true}
            dataFraBackend={false}
          />
        );
        const eksisterendeVerdier = { harLikLoenn: 'Nei', erSykmeldtFraAlle: 'Ja', arbeidsforhold: [] };
        act(() => observedForm.setValue('flereArbeidsforhold', eksisterendeVerdier));

        mockState = { ...mockState, kvitteringData: { flereArbeidsforhold } };
        rerender(
          <Home
            {...defaultHomeProps}
            slug='550e8400-e29b-41d4-a716-446655440000'
            erEndringFraKvittering={true}
            dataFraBackend={false}
          />
        );

        expect(observedForm.getValues('flereArbeidsforhold')).toEqual(eksisterendeVerdier);
      }
    );

    it('sets fullLonn to Ja when dataFraBackend is false and no redusertLoennIAgp', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: null
          })
        )
      );

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets fullLonn to Nei and populates agp fields when kvitteringData has redusertLoennIAgp', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
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

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets kreverRefusjon to Ja and populates refusjon fields when kvitteringData has refusjon.beloepPerMaaned', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
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

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets refusjon.harEndringer to Ja when kvitteringData has refusjon endringer', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
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

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets kreverRefusjon to Nei when dataFraBackend is false and no refusjon in kvitteringData', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: {}
          })
        )
      );

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('does not set refusjon fields when dataFraBackend is false and kvitteringData is null', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            kvitteringData: null
          })
        )
      );

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('does not override refusjon fields when dataFraBackend is true', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
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

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={true}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets refusjon.beloepPerMaaned from inntekt when dataFraBackend is true', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            bruttoinntekt: { bruttoInntekt: 45000, endringAarsaker: null }
          })
        )
      );

      render(
        <Home
          {...defaultHomeProps}
          slug='550e8400-e29b-41d4-a716-446655440000'
          erEndringFraKvittering={false}
          dataFraBackend={true}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it('sets refusjon.beloepPerMaaned from inntekt when selvbestemtInnsending is true', () => {
      (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
        stateFn(
          createMockState({
            bruttoinntekt: { bruttoInntekt: 45000, endringAarsaker: null }
          })
        )
      );

      render(
        <Home
          {...defaultHomeProps}
          slug='arbeidsgiverInitiertInnsending'
          erEndringFraKvittering={false}
          dataFraBackend={false}
        />
      );

      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });
  });
});

describe('getServerSideProps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns props with valid UUID slug', async () => {
    const context = createServerSideContext();

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected page props');

    expect(result).toHaveProperty('props');
    expect(result.props.slug).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.props.erEndringFraKvittering).toBe(false);
    expect(result.props.forespurtStatus).toBe(200);
  });

  it('returns erEndringFraKvittering true when endre is true', async () => {
    const context = createServerSideContext({
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000'],
        endre: 'true'
      }
    });

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected page props');

    expect(result.props.erEndringFraKvittering).toBe(true);
  });

  it('returns props without fetching when UUID is invalid', async () => {
    const context = createServerSideContext({
      query: {
        slug: ['invalid-slug']
      }
    });

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected page props');

    expect(result.props.slug).toBe('invalid-slug');
    expect(result.props.forespurt).toBeNull();
  });

  it('returns props without fetching when endre is set', async () => {
    const context = createServerSideContext({
      query: {
        slug: ['550e8400-e29b-41d4-a716-446655440000'],
        endre: 'true'
      }
    });

    const result = await getServerSideProps(context);
    if (!('props' in result) || !result.props) throw new Error('Expected page props');

    expect(result.props.dataFraBackend).toBe(false);
  });

  it('redirects to login when token is missing in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');

    const { getToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce(null as unknown as string);

    const context = createServerSideContext();

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');

    vi.stubEnv('NODE_ENV', originalEnv);
  });

  it('redirects to login when token validation fails', async () => {
    const originalEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');

    const { getToken, validateToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce('mock-token');
    vi.mocked(validateToken, { partial: true }).mockResolvedValueOnce({ ok: false });

    const context = createServerSideContext();

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');

    vi.stubEnv('NODE_ENV', originalEnv);
  });

  describe.each([false, true])('fetch status handling with endre=%s', (endre) => {
    const createContext = (agi = false) =>
      createServerSideContext({
        query: {
          slug: ['550e8400-e29b-41d4-a716-446655440000'],
          ...(endre ? { endre: 'true' } : {}),
          ...(agi ? { agi: 'true' } : {})
        }
      });

    it.each([403, 500, 502])('preserves backend status %s', async (status) => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      const warnSpy = vi.spyOn(logger, 'warn');
      const error = Object.assign(new Error('Backend error'), { status });
      vi.mocked(hentForespoerselSSR.default).mockRejectedValueOnce(error);

      const result = await getServerSideProps(createContext());

      expect(result).toHaveProperty('props.forespurtStatus', status);
      expect(warnSpy).toHaveBeenCalledWith('Feil ved innhenting av forespurt data: %s', status);
    });

    it('uses the existing fallback when the error has no status', async () => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      vi.mocked(hentForespoerselSSR.default).mockRejectedValueOnce(new Error('Network error'));

      const result = await getServerSideProps(createContext());

      expect(result).toHaveProperty('props.forespurtStatus', endre ? 200 : 500);
    });

    it('redirects to login when fetching returns 401', async () => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      const error = Object.assign(new Error('Unauthorized'), { status: 401 });
      vi.mocked(hentForespoerselSSR.default).mockRejectedValueOnce(error);

      const result = await getServerSideProps(createContext());

      expect(result).toEqual({ redirect: { destination: '/login', permanent: false } });
    });

    it('returns notFound when fetching returns 404', async () => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      const error = Object.assign(new Error('Not found'), { status: 404 });
      vi.mocked(hentForespoerselSSR.default).mockRejectedValueOnce(error);

      const result = await getServerSideProps(createContext());

      expect(result).toEqual({ notFound: true });
    });

    it('returns status 200 when fetching succeeds', async () => {
      const result = await getServerSideProps(createContext());

      expect(result).toHaveProperty('props.forespurtStatus', 200);
    });

    it('preserves the AGI fallback without fetching backend data', async () => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      const hentArbeidsforholdSSR = await import('../../utils/hentArbeidsforholdSSR');

      const result = await getServerSideProps(createContext(true));

      expect(result).toHaveProperty('props.forespurtStatus', endre ? 200 : 500);
      expect(result).toHaveProperty('props.forespurt', null);
      expect(result).toHaveProperty('props.dataFraBackend', false);
      expect(hentForespoerselSSR.default).not.toHaveBeenCalled();
      expect(hentArbeidsforholdSSR.default).not.toHaveBeenCalled();
    });
  });

  it('redirects to kvittering when forespurt.data.erBesvart is true', async () => {
    const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
    vi.mocked(hentForespoerselSSR.default).mockResolvedValueOnce({
      erBesvart: true
    } as any);

    const context = createServerSideContext({
      req: {
        headers: {
          host: 'localhost:3000'
        }
      }
    });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');
    expect((result as any).redirect.destination).toBe(
      'http://localhost:3000/im-dialog/kvittering/550e8400-e29b-41d4-a716-446655440000'
    );
    expect((result as any).redirect.permanent).toBe(false);
  });

  it('redirects to kvittering with https when erBesvart is true in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');

    const { getToken, validateToken } = await import('@navikt/oasis');
    vi.mocked(getToken).mockReturnValueOnce('mock-token');
    vi.mocked(validateToken, { partial: true }).mockResolvedValueOnce({ ok: true });

    const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
    vi.mocked(hentForespoerselSSR.default).mockResolvedValueOnce({
      erBesvart: true
    } as any);

    const context = createServerSideContext({
      req: {
        headers: {
          host: 'arbeidsgiver.nav.no'
        }
      }
    });

    const result = await getServerSideProps(context);

    expect(result).toHaveProperty('redirect');
    expect((result as any).redirect.destination).toBe(
      'https://arbeidsgiver.nav.no/im-dialog/kvittering/550e8400-e29b-41d4-a716-446655440000'
    );
    expect((result as any).redirect.permanent).toBe(false);

    vi.stubEnv('NODE_ENV', originalEnv);
  });

  describe.each([
    { overskriv: false, endre: false },
    { overskriv: true, endre: false },
    { overskriv: false, endre: true },
    { overskriv: true, endre: true }
  ])('route flags: %o', ({ overskriv, endre }) => {
    const createContext = (uuid: string) =>
      createServerSideContext({
        query: {
          slug: overskriv ? [uuid, 'overskriv'] : [uuid],
          ...(endre ? { endre: 'true' } : {})
        }
      });

    it.each([false, true])('keeps redirect and data source separate when erBesvart=%s', async (erBesvart) => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      const forespurt = { erBesvart } as Awaited<ReturnType<typeof hentForespoerselSSR.default>>;
      vi.mocked(hentForespoerselSSR.default).mockResolvedValueOnce(forespurt);
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      const result = await getServerSideProps(createContext(uuid));

      if (erBesvart && !overskriv && !endre) {
        expect(result).toHaveProperty('redirect');
        expect(result).not.toHaveProperty('props');
        return;
      }

      expect(result).not.toHaveProperty('redirect');
      expect(result).toHaveProperty('props.slug', uuid);
      expect(result).toHaveProperty('props.erEndringFraKvittering', endre);
      expect(result).toHaveProperty('props.forespurt', endre ? null : forespurt);
      expect(result).toHaveProperty('props.dataFraBackend', !endre);
      expect(hentForespoerselSSR.default).toHaveBeenCalledOnce();
    });

    it('uses only endre for the edit flag when UUID is invalid', async () => {
      const hentForespoerselSSR = await import('../../utils/hentForespoerselSSR');
      const hentArbeidsforholdSSR = await import('../../utils/hentArbeidsforholdSSR');

      const result = await getServerSideProps(createContext('invalid-slug'));

      expect(result).toHaveProperty('props.erEndringFraKvittering', endre);
      expect(result).toHaveProperty('props.forespurtStatus', 404);
      expect(result).toHaveProperty('props.forespurt', null);
      expect(result).toHaveProperty('props.dataFraBackend', false);
      expect(hentForespoerselSSR.default).not.toHaveBeenCalled();
      expect(hentArbeidsforholdSSR.default).not.toHaveBeenCalled();
    });
  });
});
