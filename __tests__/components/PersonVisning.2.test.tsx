import { render, configure } from '@testing-library/react';
import Person from '../../components/Person/PersonVisning';
import useBoundStore from '../../state/useBoundStore';
import { Mock } from 'vitest';

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

describe('Person component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configure({ testIdAttribute: 'data-cy' });
  });

  it('renders correctly when data is loaded', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        sykmeldt: {
          navn: 'John Doe',
          fnr: '12345678901'
        },
        avsender: {
          orgnr: '987654321',
          orgNavn: 'Example Company',
          navn: 'Jane Doe',
          tlf: '12345678'
        },
        feilVedLasting: {
          persondata: null, // feilHentingAvPersondata
          arbeidsgiverdata: null // feilHentingAvArbeidsgiverdata
        }
      })
    );

    const { getByText, getByTestId } = render(<Person />);

    expect(getByText('Den ansatte')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByTestId('identitetsnummer')).toHaveTextContent('12345678901');
    expect(getByText('Arbeidsgiveren')).toBeInTheDocument();
    expect(getByText('Example Company')).toBeInTheDocument();
    expect(getByTestId('orgnummer')).toHaveTextContent('987654321');
    expect(getByTestId('innsendernavn')).toHaveTextContent('Jane Doe');
    expect(getByText('12345678')).toBeInTheDocument();
  });

  it('renders skeleton loaders when data is not loaded', () => {
    configure({ testIdAttribute: 'data-cy' });
    (useBoundStore as vi.Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        sykmeldt: {
          navn: null,
          fnr: null
        },
        avsender: {
          orgnr: null,
          orgNavn: null,
          navn: null,
          tlf: null
        },
        feilVedLasting: {
          persondata: null, // feilHentingAvPersondata
          arbeidsgiverdata: null // feilHentingAvArbeidsgiverdata
        },
        feilHentingAvPersondata: [], // feilHentingAvPersondata
        feilHentingAvArbeidsgiverdata: []
      })
    );

    const { getByTestId } = render(<Person />);

    expect(getByTestId('navn').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('identitetsnummer').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('virksomhetsnavn').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('orgnummer').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('innsendernavn').querySelector('.navds-skeleton')).toBeInTheDocument();
  });

  it('renders error message when data fetching fails', () => {
    (useBoundStore as vi.Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        sykmeldt: {
          navn: null,
          fnr: null
        },
        avsender: {
          orgnr: null,
          orgNavn: null,
          navn: null,
          tlf: null
        },
        feilVedLasting: {
          persondata: 'Error fetching person data', // feilHentingAvPersondata
          arbeidsgiverdata: null // feilHentingAvArbeidsgiverdata
        },
        feilHentingAvPersondata: ['Error fetching person data'], // feilHentingAvPersondata
        feilHentingAvArbeidsgiverdata: ['Error fetching employer data'] // feilHentingAvArbeidsgiverdata
      })
    );

    const { getByText } = render(<Person />);

    expect(
      getByText(
        'Vi klarer ikke hente navn på den ansatte og bedriften akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at personnummer og organisasjonsnummer stemmer.'
      )
    ).toBeInTheDocument();
  });

  it('renders partial submission message when erDelvisInnsending is true', () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        sykmeldt: {
          navn: 'John Doe',
          fnr: '12345678901'
        },
        avsender: {
          orgnr: '987654321',
          orgNavn: 'Example Company',
          navn: 'Jane Doe',
          tlf: '12345678'
        },
        feilVedLasting: {
          persondata: null, // feilHentingAvPersondata
          arbeidsgiverdata: null // feilHentingAvArbeidsgiverdata
        },
        feilHentingAvPersondata: [], // feilHentingAvPersondata
        feilHentingAvArbeidsgiverdata: []
      })
    );

    const { getByText } = render(<Person erDelvisInnsending={true} />);

    expect(
      getByText(
        'Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige sykefravær trenger vi bare informasjon om inntekt og refusjon.'
      )
    ).toBeInTheDocument();
  });
});
