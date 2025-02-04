import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
// import RefusjonArbeidsgiver from './RefusjonArbeidsgiver';
import useBoundStore from '../../state/useBoundStore';
import RefusjonArbeidsgiver from '../../components/RefusjonArbeidsgiver';
import parseIsoDate from '../../utils/parseIsoDate';

vi.mock('../../state/useBoundStore', () => ({
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

describe('RefusjonArbeidsgiver', () => {
  const mockSetIsDirtyForm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useBoundStore.mockImplementation((stateFn) =>
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
        arbeidsgiverperioder: [{ fom: parseIsoDate('2023-10-01'), tom: parseIsoDate('2023-10-10') }],
        visFeilmeldingsTekst: vi.fn(),
        arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: vi.fn(),
        arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret: vi.fn(),
        begrunnelseRedusertUtbetaling: vi.fn(),
        beloepArbeidsgiverBetalerISykefravaeret: vi.fn(),
        refusjonskravetOpphoererStatus: vi.fn(),
        setBeloepUtbetaltUnderArbeidsgiverperioden: vi.fn(),
        arbeidsgiverperiodeDisabled: false,
        arbeidsgiverperiodeKort: false,
        refusjonskravetOpphoererDato: vi.fn(),
        setHarRefusjonEndringer: vi.fn(),
        refusjonEndringer: [],
        oppdaterRefusjonEndringer: vi.fn(),
        harRefusjonEndringer: false
      })
    );
  });

  it('should call setIsDirtyForm when radio button is changed', () => {
    render(<RefusjonArbeidsgiver setIsDirtyForm={mockSetIsDirtyForm} />);

    const radioButton = screen.getAllByLabelText('Ja');
    fireEvent.click(radioButton[0]);

    expect(mockSetIsDirtyForm).toHaveBeenCalledWith(true);
  });

  it('should call setIsDirtyForm when text field is changed', () => {
    render(<RefusjonArbeidsgiver setIsDirtyForm={mockSetIsDirtyForm} />);

    const textField = screen.getByLabelText('Utbetalt under arbeidsgiverperiode');
    fireEvent.change(textField, { target: { value: '1000' } });

    expect(mockSetIsDirtyForm).toHaveBeenCalledWith(true);
  });

  it('should call setIsDirtyForm when date is changed', () => {
    render(<RefusjonArbeidsgiver setIsDirtyForm={mockSetIsDirtyForm} />);

    const datePicker = screen.getByLabelText('Angi siste dag dere krever refusjon for');
    fireEvent.change(datePicker, { target: { value: '2023-10-10' } });

    expect(mockSetIsDirtyForm).toHaveBeenCalledWith(true);
  });
});
