import { render, configure } from '@testing-library/react';
import Person from '../../components/Person/PersonVisning';
import useBoundStore from '../../state/useBoundStore';
import { Mock } from 'vitest';

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn()
}));

describe('Person component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configure({ testIdAttribute: 'data-cy' });
  });

  it('renders correctly when data is loaded', () => {
    (useBoundStore as Mock).mockReturnValue([
      'John Doe', // navn
      '12345678901', // identitetsnummer
      '987654321', // orgnrUnderenhet
      'Example Company', // virksomhetsnavn
      'Jane Doe', // innsenderNavn
      null, // feilHentingAvPersondata
      null, // feilHentingAvArbeidsgiverdata
      '12345678' // innsenderTelefonNr
    ]);

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
    (useBoundStore as vi.Mock).mockReturnValue([
      null, // navn
      null, // identitetsnummer
      null, // orgnrUnderenhet
      null, // virksomhetsnavn
      null, // innsenderNavn
      null, // feilHentingAvPersondata
      null, // feilHentingAvArbeidsgiverdata
      null // innsenderTelefonNr
    ]);

    const { getByTestId } = render(<Person />);

    expect(getByTestId('navn').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('identitetsnummer').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('virksomhetsnavn').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('orgnummer').querySelector('.navds-skeleton')).toBeInTheDocument();
    expect(getByTestId('innsendernavn').querySelector('.navds-skeleton')).toBeInTheDocument();
  });

  it('renders error message when data fetching fails', () => {
    (useBoundStore as vi.Mock).mockReturnValue([
      null, // navn
      null, // identitetsnummer
      null, // orgnrUnderenhet
      null, // virksomhetsnavn
      null, // innsenderNavn
      ['Error fetching person data'], // feilHentingAvPersondata
      ['Error fetching employer data'], // feilHentingAvArbeidsgiverdata
      null // innsenderTelefonNr
    ]);

    const { getByText } = render(<Person />);

    expect(
      getByText(
        'Vi klarer ikke hente navn på den ansatte og bedriften akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at personnummer og organisasjonsnummer stemmer.'
      )
    ).toBeInTheDocument();
  });

  it('renders partial submission message when erDelvisInnsending is true', () => {
    (useBoundStore as vi.Mock).mockReturnValue([
      'John Doe', // navn
      '12345678901', // identitetsnummer
      '987654321', // orgnrUnderenhet
      'Example Company', // virksomhetsnavn
      'Jane Doe', // innsenderNavn
      null, // feilHentingAvPersondata
      null, // feilHentingAvArbeidsgiverdata
      '12345678' // innsenderTelefonNr
    ]);

    const { getByText } = render(<Person erDelvisInnsending={true} />);

    expect(
      getByText(
        'Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige sykefravær trenger vi bare informasjon om inntekt og refusjon.'
      )
    ).toBeInTheDocument();
  });
});
