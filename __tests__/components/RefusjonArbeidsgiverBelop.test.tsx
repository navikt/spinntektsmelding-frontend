import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import RefusjonArbeidsgiverBelop from '../../components/RefusjonArbeidsgiver/RefusjonArbeidsgiverBelop';
import { expect } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';

// Wrapper-komponent for å gi FormProvider context
function TestWrapper({
  children,
  defaultValues = {}
}: Readonly<{
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}>) {
  const methods = useForm({
    defaultValues: {
      refusjon: {
        beloepPerMaaned: 500000,
        isEditing: false
      },
      ...defaultValues
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('RefusjonArbeidsgiverBelop', () => {
  it('should render the component with the correct props', () => {
    render(
      <TestWrapper>
        <RefusjonArbeidsgiverBelop arbeidsgiverperiodeDisabled={false} />
      </TestWrapper>
    );

    expect(screen.getByText('Refusjon til arbeidsgiver etter arbeidsgiverperiode')).toBeInTheDocument();
    expect(screen.getByText(/500 000,00/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil refundere opp til 6G av årslønn./
      )
    ).toBeInTheDocument();
  });

  it('should render the component with the correct props when arbeidsgiverperiodeDisabled is true', () => {
    render(
      <TestWrapper>
        <RefusjonArbeidsgiverBelop arbeidsgiverperiodeDisabled={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Refusjon til arbeidsgiver i sykefraværet')).toBeInTheDocument();
    expect(screen.getByText(/500 000,00/)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil refundere opp til 6G av årslønn.'
      )
    ).toBeInTheDocument();
  });

  it('should render the component with an edit button', () => {
    render(
      <TestWrapper>
        <RefusjonArbeidsgiverBelop />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Endre' })).toBeInTheDocument();
  });

  it('should render the component with an editable input field when the edit button is clicked', () => {
    render(
      <TestWrapper defaultValues={{ refusjon: { beloepPerMaaned: 500000, isEditing: false } }}>
        <RefusjonArbeidsgiverBelop />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Endre' }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should update form value when the input field is changed', () => {
    render(
      <TestWrapper defaultValues={{ refusjon: { beloepPerMaaned: 500000, isEditing: true } }}>
        <RefusjonArbeidsgiverBelop />
      </TestWrapper>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '600000' } });

    expect(input).toHaveValue('600000');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <RefusjonArbeidsgiverBelop />
      </TestWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
