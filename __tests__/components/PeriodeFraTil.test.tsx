import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import PeriodeFraTil from '../../components/PeriodeFraTil/PeriodeFraTil';

describe('PeriodeFraTil', () => {
  it('renders a title text', async () => {
    const { container } = render(<PeriodeFraTil fom={new Date(2025, 3, 5)} tom={new Date(2025, 3, 7)} />);

    expect(screen.getByText('Fra')).toBeInTheDocument();
    expect(screen.getByText('05.04.2025')).toBeInTheDocument();
    expect(screen.getByText('Til')).toBeInTheDocument();
    expect(screen.getByText('07.04.2025')).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
