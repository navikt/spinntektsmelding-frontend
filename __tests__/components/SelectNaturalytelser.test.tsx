import { screen } from '@testing-library/react';
import SelectNaturalytelser from '../../components/Naturalytelser/SelectNaturalytelser/SelectNaturalytelser';
import { renderWithRHF } from '../testUtils/renderWithRHF';

describe('SelectNaturalytelser', () => {
  it('renders the select component', () => {
    renderWithRHF(<SelectNaturalytelser name='naturalytelse' />, {
      defaultValues: { naturalytelse: 'BIL' }
    });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders the default value if provided', () => {
    renderWithRHF(<SelectNaturalytelser name='naturalytelse' defaultValue='bil' />, {
      defaultValues: { naturalytelse: 'BIL' }
    });
    expect(screen.getByRole('combobox')).toHaveValue('BIL');
  });

  it('renders the error message if provided', async () => {
    const { methods } = renderWithRHF(<SelectNaturalytelser name='naturalytelse' />, {
      defaultValues: { naturalytelse: 'BIL' }
    });
    methods.setError('naturalytelse', { type: 'manual', message: 'This is an error' });
    expect(await screen.findByText('This is an error')).toBeInTheDocument();
  });
});
