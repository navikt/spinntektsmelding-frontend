import { render, screen } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import SelectNaturalytelser from '../../components/Naturalytelser/SelectNaturalytelser/SelectNaturalytelser';
import { vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';

describe('SelectNaturalytelser', () => {
  const Wrapper: React.FC<PropsWithChildren<{ defaultValues?: any; setError?: boolean }>> = ({
    children,
    defaultValues,
    setError
  }) => {
    const methods = useForm({ defaultValues });
    if (setError) {
      methods.setError('naturalytelse', { type: 'manual', message: 'This is an error' });
    }
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('renders the select component', () => {
    render(
      <Wrapper defaultValues={{ naturalytelse: 'BIL' }}>
        <SelectNaturalytelser name='naturalytelse' />
      </Wrapper>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders the default value if provided', () => {
    render(
      <Wrapper defaultValues={{ naturalytelse: 'BIL' }}>
        <SelectNaturalytelser name='naturalytelse' defaultValue='bil' />
      </Wrapper>
    );
    expect(screen.getByRole('combobox')).toHaveValue('BIL');
  });

  it('renders the error message if provided', async () => {
    render(
      <Wrapper defaultValues={{ naturalytelse: 'BIL' }} setError>
        <SelectNaturalytelser name='naturalytelse' />
      </Wrapper>
    );
    expect(await screen.findByText('This is an error')).toBeInTheDocument();
  });
});
