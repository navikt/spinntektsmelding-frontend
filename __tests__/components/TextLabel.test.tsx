import { configure, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import TextLabel from '../../components/TextLabel/TextLabel';

describe('TextLabel', () => {
  beforeEach(() => {
    configure({
      throwSuggestions: true
    });
  });

  it('renders a title text', () => {
    render(<TextLabel>Innholdstekst</TextLabel>);

    const HeadingTitle = screen.getByText(/Innholdstekst/i);

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TextLabel>Innholdstekst</TextLabel>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
