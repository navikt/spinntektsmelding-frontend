import { render, fireEvent } from '@testing-library/react';
import Person from '../../components/PersonData/PersonData';
import { expect } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';

describe('Person component', () => {
  it('renders correctly with erKvittering=false', () => {
    const TestInput = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Person erKvittering={false} />
        </FormProvider>
      );
    };
    const { getByText } = render(<TestInput />);
    expect(getByText(/For at vi skal utbetale riktig beløp i forbindelse med sykmelding/)).toBeInTheDocument();
  });

  it('renders correctly with erKvittering=true', () => {
    const TestInput = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Person erKvittering={true} />
        </FormProvider>
      );
    };
    const { queryByText } = render(<TestInput />);

    expect(queryByText('For at vi skal utbetale riktig beløp i forbindelse med sykmelding')).not.toBeInTheDocument();
  });

  it('renders correctly with erDelvisInnsending=true', () => {
    const TestInput = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Person erDelvisInnsending={true} />
        </FormProvider>
      );
    };
    const { getByText } = render(<TestInput />);
    expect(getByText(/Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige/)).toBeInTheDocument();
  });

  it('renders correctly with erDelvisInnsending=false', () => {
    const TestInput = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Person erDelvisInnsending={false} />
        </FormProvider>
      );
    };
    const { queryByText } = render(<TestInput />);
    expect(
      queryByText(/Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige/)
    ).not.toBeInTheDocument();
  });
});
