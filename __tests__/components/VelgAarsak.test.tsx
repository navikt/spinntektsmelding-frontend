import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
// import VelgAarsak from './VelgAarsak';

vi.mock('react-hook-form', () => ({
  Controller: ({ render }) =>
    render({
      field: {
        name: 'aarsak',
        value: '',
        onChange: () => {},
        onBlur: () => {}
      }
    }),
  useFormContext: () => ({
    formState: { errors: {} }
  })
}));

vi.mock('../../utils/findErrorInRHFErrors', () => ({
  default: vi.fn(() => undefined)
}));

describe('VelgAarsak', () => {
  const legend = 'Velg årsak';
  const name = 'aarsak';

  it('renders the legend and all radio options', () => {
    render(<VelgAarsak legend={legend} name={name} />);

    // RadioGroup should have the correct accessible name
    expect(screen.getByRole('group', { name: legend })).toBeInTheDocument();

    // Each radio option by its label
    expect(screen.getByLabelText('Unntatt registrering i Aa-registeret')).toBeInTheDocument();
    expect(screen.getByLabelText('Fisker med hyre')).toBeInTheDocument();
    expect(screen.getByLabelText('Annen årsak')).toBeInTheDocument();
  });

  it.skip('allows selecting a radio option', async () => {
    render(<VelgAarsak legend={legend} name={name} />);

    // const fiskerRadio = screen.getByLabelText('Fisker med hyre') as HTMLInputElement;
    const fiskerRadio = screen.getByRole('radio', { name: /Fisker med hyre/i });

    await userEvent.click(fiskerRadio);
    expect(fiskerRadio).toBeChecked();
  });
});
