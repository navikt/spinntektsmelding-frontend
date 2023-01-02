import { configure, render, screen } from '@testing-library/react';
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
});
