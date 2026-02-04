import { render, screen, fireEvent } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import { axe } from 'jest-axe';
import useBoundStore from '../../state/useBoundStore';
import RefusjonArbeidsgiver from '../../components/RefusjonArbeidsgiver';
import parseIsoDate from '../../utils/parseIsoDate';
import { FormProvider, useForm } from 'react-hook-form';

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

// Wrapper-komponent for å gi FormProvider context
function TestWrapper({
  children,
  defaultValues = {}
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const methods = useForm({
    defaultValues: {
      refusjon: {
        beloepPerMaaned: 500000,
        isEditing: false,
        harEndringer: undefined,
        endringer: []
      },
      kreverRefusjon: undefined,
      agp: {
        fullLonn: undefined,
        utbetalt: undefined,
        begrunnelse: undefined
      },
      ...defaultValues
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

function buildState(overrides: Partial<Record<string, any>> = {}) {
  return {
    arbeidsgiverperioder: [
      { fom: parseIsoDate('2023-10-11'), tom: parseIsoDate('2023-10-16') },
      { fom: parseIsoDate('2023-10-01'), tom: parseIsoDate('2023-10-10') }
    ],
    arbeidsgiverperiodeDisabled: false,
    arbeidsgiverperiodeKort: false,
    setEndringerAvRefusjon: vi.fn(),
    sykmeldingsperioder: [],
    egenmeldingsperioder: [],
    ...overrides
  };
}

describe('RefusjonArbeidsgiver', () => {
  it('should show full lønn radio when skalViseArbeidsgiverperiode is true', () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper defaultValues={{ agp: { fullLonn: 'Nei' } }}>
        <RefusjonArbeidsgiver skalViseArbeidsgiverperiode={true} inntekt={1000} />
      </TestWrapper>
    );

    expect(screen.getByText(/Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/)).toBeInTheDocument();
  });

  it('should show utbetalt field when agp.fullLonn is Nei', () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper defaultValues={{ fullLonn: 'Nei' }}>
        <RefusjonArbeidsgiver skalViseArbeidsgiverperiode={true} inntekt={1000} />
      </TestWrapper>
    );

    const textField = screen.getByLabelText('Utbetalt under arbeidsgiverperiode');
    expect(textField).toBeInTheDocument();
  });

  it('should show a warning when sykefravaer betviles', () => {
    vi.clearAllMocks();
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper
        defaultValues={{ fullLonn: 'Nei', agp: { redusertLoennIAgp: { begrunnelse: 'BetvilerArbeidsufoerhet' } } }}
      >
        <RefusjonArbeidsgiver skalViseArbeidsgiverperiode={true} inntekt={1234} />
      </TestWrapper>
    );

    expect(screen.getByText(/Innen 14 dager må du sende et brev til Nav/)).toBeInTheDocument();
  });

  it('should update utbetalt when text field is changed', () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper defaultValues={{ fullLonn: 'Nei' }}>
        <RefusjonArbeidsgiver inntekt={25000} skalViseArbeidsgiverperiode />
      </TestWrapper>
    );

    const belopInput = screen.getByLabelText(/Utbetalt under arbeidsgiverperiode/i);
    fireEvent.change(belopInput, { target: { value: '12345' } });

    expect(belopInput).toHaveValue('12345');
  });

  it('handles agp.fullLonn = Ja path without showing utbetalt field', () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper defaultValues={{ agp: { fullLonn: 'Ja' } }}>
        <RefusjonArbeidsgiver inntekt={5000} skalViseArbeidsgiverperiode />
      </TestWrapper>
    );

    expect(screen.queryByLabelText(/Utbetalt under arbeidsgiverperiode/i)).toBeNull();
  });

  it('should show refusjon fields when lonnISykefravaeret is Ja', () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper defaultValues={{ kreverRefusjon: 'Ja' }}>
        <RefusjonArbeidsgiver inntekt={5000} skalViseArbeidsgiverperiode />
      </TestWrapper>
    );

    expect(screen.getByText(/Er det endringer i refusjonsbeløpet/)).toBeInTheDocument();
  });

  it('should not show refusjon fields when lonnISykefravaeret is Nei', () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    render(
      <TestWrapper defaultValues={{ kreverRefusjon: 'Nei' }}>
        <RefusjonArbeidsgiver inntekt={5000} skalViseArbeidsgiverperiode />
      </TestWrapper>
    );

    expect(screen.queryByText(/Er det endringer i refusjonsbeløpet/)).toBeNull();
  });

  it('should have no accessibility violations', async () => {
    const state = buildState();
    (useBoundStore as unknown as Mock).mockImplementation((fn) => fn(state));

    const { container } = render(
      <TestWrapper defaultValues={{ agp: { fullLonn: 'Nei' }, kreverRefusjon: 'Ja' }}>
        <RefusjonArbeidsgiver skalViseArbeidsgiverperiode={true} inntekt={1000} />
      </TestWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
