import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Person from '../../components/Person/PersonVisning';

describe('Person component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Person />);
    expect(getByText(/Telefon innsender/)).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Person />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
