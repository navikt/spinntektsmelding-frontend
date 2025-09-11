import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import Home from '../../pages/[...slug]';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import useSendInnSkjema from '../../utils/useSendInnSkjema';
import useSendInnArbeidsgiverInitiertSkjema from '../../utils/useSendInnArbeidsgiverInitiertSkjema';
import useBoundStore from '../../state/useBoundStore';
import visFeilmeldingTekst from '../../utils/visFeilmeldingTekst';

// Mock all necessary modules
vi.mock('next/head', () => ({
  default: ({ children }) => <>{children}</>
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

vi.mock('../../utils/useTidligereInntektsdata', () => ({
  default: vi.fn(() => ({ data: null, error: null }))
}));

// // Mock the store with the necessary state values
// vi.mock('../../state/useBoundStore', () => {
//   const store = {
//     slettFeilmelding: vi.fn(),
//     leggTilFeilmelding: vi.fn(),
//     foreslaattBestemmendeFravaersdag: '2023-01-01',
//     sykmeldingsperioder: [],
//     egenmeldingsperioder: [],
//     skjemaFeilet: false,
//     skjemastatus: SkjemaStatus.UNDER_UTFYLLING,
//     inngangFraKvittering: false,
//     arbeidsgiverperioder: [],
//     setTidligereInntekter: vi.fn(),
//     setPaakrevdeOpplysninger: vi.fn(),
//     hentPaakrevdOpplysningstyper: vi.fn().mockReturnValue(['inntekt']),
//     arbeidsgiverKanFlytteSkjæringstidspunkt: vi.fn().mockReturnValue(false),
//     initBruttoinntekt: vi.fn(),
//     bruttoinntekt: { bruttoInntekt: 10000, endringAarsaker: null },
//     beloepArbeidsgiverBetalerISykefravaeret: vi.fn(),
//     avsender: { tlf: '12345678', orgnr: '123456789' },
//     sykmeldt: { fnr: '12345678910' }
//   };

//   return {
//     default: vi.fn((selector) => selector(store))
//   };
// });

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

(useBoundStore as Mock).mockImplementation((stateFn) =>
  stateFn({
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
    visFeilmelding: vi.fn((key) => true)
  })
);

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

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    // vi.mocked(useSendInnSkjema).mockReturnValue(mockSendInnSkjema);
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
});
