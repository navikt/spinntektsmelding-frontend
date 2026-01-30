import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';

import RefusjonUtbetalingEndring from '../../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import { FormProvider, useForm } from 'react-hook-form';
import React from 'react';

interface TestWrapperProps {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}

function TestWrapper({ children, defaultValues = {} }: TestWrapperProps) {
  const methods = useForm({
    defaultValues: {
      refusjon: {
        harEndringer: undefined,
        endringer: []
      },
      ...defaultValues
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('RefusjonUtbetalingEndring', () => {
  it('should have no violations and show some text', async () => {
    const { container } = render(
      <TestWrapper>
        <RefusjonUtbetalingEndring />
      </TestWrapper>
    );

    const HeadingTitle = screen.getByText(
      /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/i
    );

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should add periode when "Legg til periode" is clicked', async () => {
    render(
      <TestWrapper defaultValues={{ refusjon: { harEndringer: 'Ja', endringer: [{}] } }}>
        <RefusjonUtbetalingEndring />
      </TestWrapper>
    );

    // Start med 1 periode
    let beloepInputs = screen.getAllByLabelText(/Endret beløp\/måned/i);
    expect(beloepInputs).toHaveLength(1);

    const Button = screen.getByText(/Legg til periode/i);
    fireEvent.click(Button);

    // Verifiser at det nå er 2 perioder
    await waitFor(() => {
      beloepInputs = screen.getAllByLabelText(/Endret beløp\/måned/i);
      expect(beloepInputs).toHaveLength(2);
    });
  });

  it('should show endringer fields when Ja is clicked', async () => {
    render(
      <TestWrapper defaultValues={{ refusjon: { harEndringer: undefined, endringer: [{}] } }}>
        <RefusjonUtbetalingEndring />
      </TestWrapper>
    );

    const Button = screen.getByText(/Ja/i);

    Button.click();

    // Etter å klikke Ja, skal endringsfeltene vises
    const beloepInput = screen.getByLabelText(/Endret beløp\/måned/i);
    expect(beloepInput).toBeInTheDocument();
  });

  it('should delete periode when "Slett" is clicked', async () => {
    render(
      <TestWrapper
        defaultValues={{ refusjon: { harEndringer: 'Ja', endringer: [{ beloep: 1234 }, { beloep: 5678 }] } }}
      >
        <RefusjonUtbetalingEndring />
      </TestWrapper>
    );

    // Sjekk at det er 2 perioder
    let beloepInputs = screen.getAllByLabelText(/Endret beløp\/måned/i);
    expect(beloepInputs).toHaveLength(2);

    const SlettButton = screen.getAllByTitle(/Slett periode/i).pop();
    fireEvent.click(SlettButton as Element);

    // Sjekk at det nå er 1 periode
    beloepInputs = screen.getAllByLabelText(/Endret beløp\/måned/i);
    expect(beloepInputs).toHaveLength(1);
  });

  it('should update beløp when value is changed', async () => {
    render(
      <TestWrapper defaultValues={{ refusjon: { harEndringer: 'Ja', endringer: [{}] } }}>
        <RefusjonUtbetalingEndring />
      </TestWrapper>
    );

    const Input = screen.getByLabelText(/Endret beløp\/måned/i);

    fireEvent.change(Input, {
      target: { value: '1234' }
    });

    expect(Input).toHaveValue('1234');
  });

  it('should update dato when value is changed', async () => {
    render(
      <TestWrapper defaultValues={{ refusjon: { harEndringer: 'Ja', endringer: [{}] } }}>
        <RefusjonUtbetalingEndring />
      </TestWrapper>
    );

    const Input = screen.getByLabelText(/Dato for endring/i);

    fireEvent.change(Input, {
      target: { value: '11.11.2022' }
    });

    expect(Input).toHaveValue('11.11.2022');
  });
});
