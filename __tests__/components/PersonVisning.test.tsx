import { render } from '@testing-library/react';
import Person from '../../components/Person/PersonVisning';

describe('Person component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Person />);
    expect(getByText(/Telefon innsender/)).toBeInTheDocument();
  });
});
