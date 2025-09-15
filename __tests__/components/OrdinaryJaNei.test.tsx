import { screen } from '@testing-library/react';
import OrdinaryJaNei from '../../components/OrdinaryJaNei/OrdinaryJaNei';
import { renderWithRHF } from '../testUtils/renderWithRHF';

describe('OrdinaryJaNei', () => {
  it('renders the component with given legend and name', () => {
    renderWithRHF(<OrdinaryJaNei legend='Test Legend' name='testName' />, { defaultValues: { testName: undefined } });

    expect(screen.getByText('Test Legend')).toBeInTheDocument();
    expect(screen.getByLabelText('Ja')).toBeInTheDocument();
    expect(screen.getByLabelText('Nei')).toBeInTheDocument();
  });
});
