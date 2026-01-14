import { configure, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Loading from '../../components/Loading/Loading';

describe('Loading', () => {
  beforeEach(() => {
    configure({
      throwSuggestions: true
    });
  });

  it('renders a title text', () => {
    render(<Loading />);

    const HeadingTitle = screen.getByText(/Laster arbeidsforhold/i);

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Loading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
