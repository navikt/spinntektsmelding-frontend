import Naturalytelser from '../../components/Naturalytelser';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormProvider, useForm } from 'react-hook-form';

type FormValues = {
  inntekt: {
    harBortfallAvNaturalytelser: boolean;
    naturalytelser: Array<{ naturalytelse: string; sluttdato: Date | undefined; verdiBeloep: number | string }>;
  };
};

function Harness({ defaultValues }: { defaultValues: FormValues }) {
  const methods = useForm<FormValues>({ defaultValues });
  return (
    <FormProvider {...methods}>
      <form>
        <Naturalytelser />
      </form>
    </FormProvider>
  );
}

const checkboxLabel = 'Har den ansatte naturalytelser som faller bort under sykefraværet?';

describe('Naturalytelser – checkbox toggling (ekte form-context)', () => {
  it('initialiserer en naturalytelse-rad når checkboxen hukes av', () => {
    render(<Harness defaultValues={{ inntekt: { harBortfallAvNaturalytelser: false, naturalytelser: [] } }} />);

    expect(screen.queryByRole('columnheader', { name: 'Naturalytelse' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(checkboxLabel));

    expect(screen.getByRole('columnheader', { name: 'Naturalytelse' })).toBeInTheDocument();
  });

  it('fjerner alle naturalytelser når checkboxen hukes av igjen', () => {
    render(
      <Harness
        defaultValues={{
          inntekt: {
            harBortfallAvNaturalytelser: true,
            naturalytelser: [{ naturalytelse: 'BIL', sluttdato: new Date(), verdiBeloep: 123 }]
          }
        }}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Naturalytelse' })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(checkboxLabel));

    expect(screen.queryByRole('columnheader', { name: 'Naturalytelse' })).not.toBeInTheDocument();
  });
});
