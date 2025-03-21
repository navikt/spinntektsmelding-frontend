import { render, screen, fireEvent } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import RefusjonArbeidsgiver from '../../components/RefusjonArbeidsgiver';
import parseIsoDate from '../../utils/parseIsoDate';

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

describe('RefusjonArbeidsgiver', () => {
  const mockSetIsDirtyForm = vi.fn();

  beforeEach(() => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn({
        lonnISykefravaeret: {
          status: 'Ja'
        },
        fullLonnIArbeidsgiverPerioden: {
          status: 'Nei'
        },
        refusjonskravetOpphoerer: {
          status: 'Ja'
        },
        arbeidsgiverperioder: [
          { fom: parseIsoDate('2023-10-11'), tom: parseIsoDate('2023-10-16') },
          { fom: parseIsoDate('2023-10-01'), tom: parseIsoDate('2023-10-10') }
        ],
        visFeilmeldingTekst: vi.fn(),
        arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: vi.fn(),
        arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: vi.fn(),
        begrunnelseRedusertUtbetaling: vi.fn(),
        beloepArbeidsgiverBetalerISykefravaeret: vi.fn(),
        setBeloepUtbetaltUnderArbeidsgiverperioden: vi.fn(),
        arbeidsgiverperiodeDisabled: false,
        arbeidsgiverperiodeKort: false,
        setHarRefusjonEndringer: vi.fn(),
        refusjonEndringer: [],
        oppdaterRefusjonEndringer: vi.fn(),
        harRefusjonEndringer: false
      })
    );
  });

  it('should call setIsDirtyForm when radio button is changed', () => {
    render(
      <RefusjonArbeidsgiver setIsDirtyForm={mockSetIsDirtyForm} skalViseArbeidsgiverperiode={true} inntekt={1000} />
    );

    const radioButton = screen.getAllByLabelText('Ja');
    fireEvent.click(radioButton[0]);

    expect(mockSetIsDirtyForm).toHaveBeenCalledWith(true);
  });

  it('should call setIsDirtyForm when text field is changed', () => {
    render(
      <RefusjonArbeidsgiver setIsDirtyForm={mockSetIsDirtyForm} skalViseArbeidsgiverperiode={true} inntekt={1000} />
    );

    const textField = screen.getByLabelText('Utbetalt under arbeidsgiverperiode');
    fireEvent.change(textField, { target: { value: '1000' } });

    expect(mockSetIsDirtyForm).toHaveBeenCalledWith(true);
  });

  it('should show a warning when sykefravaer betviles', () => {
    vi.clearAllMocks();
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn({
        lonnISykefravaeret: {
          status: 'Ja'
        },
        fullLonnIArbeidsgiverPerioden: {
          status: 'Nei',
          begrunnelse: 'BetvilerArbeidsufoerhet'
        },
        refusjonskravetOpphoerer: {
          status: 'Ja'
        },
        arbeidsgiverperioder: [
          { fom: parseIsoDate('2023-10-11'), tom: parseIsoDate('2023-10-16') },
          { fom: parseIsoDate('2023-10-01'), tom: parseIsoDate('2023-10-10') }
        ],
        visFeilmeldingTekst: vi.fn(),
        arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: vi.fn(),
        arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: vi.fn(),
        begrunnelseRedusertUtbetaling: vi.fn(),
        beloepArbeidsgiverBetalerISykefravaeret: vi.fn(),
        setBeloepUtbetaltUnderArbeidsgiverperioden: vi.fn(),
        arbeidsgiverperiodeDisabled: false,
        arbeidsgiverperiodeKort: false,
        setHarRefusjonEndringer: vi.fn(),
        refusjonEndringer: [],
        oppdaterRefusjonEndringer: vi.fn(),
        harRefusjonEndringer: false
      })
    );
    render(
      <RefusjonArbeidsgiver setIsDirtyForm={mockSetIsDirtyForm} skalViseArbeidsgiverperiode={true} inntekt={1234} />
    );

    expect(screen.getByText(/Innen 14 dager må du sende et brev til Nav/)).toBeInTheDocument();
  });
});
