import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import H3Label from '../../components/H3Label';

describe('H3Label', () => {
  it('renders the heading with correct level and size', () => {
    const { getByRole } = render(<H3Label>Test Heading</H3Label>);
    const heading = getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Heading');
    expect(heading).toHaveClass('heading');
  });

  it('applies top padding when topPadded prop is true', () => {
    const { getByRole } = render(<H3Label topPadded>Test Heading</H3Label>);
    const heading = getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('heading');
    expect(heading).toHaveClass('heading_top');
  });

  it('does not apply padding when unPadded prop is true', () => {
    const { getByRole } = render(<H3Label unPadded>Test Heading</H3Label>);
    const heading = getByRole('heading', { level: 3 });
    expect(heading).not.toHaveClass('heading');
  });

  it('passes a11y testing', async () => {
    const { container } = render(<H3Label>Test Heading</H3Label>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
