import { configure, render, screen } from '@testing-library/react';
import LabelLabel from '../../components/LabelLabel';

describe('LabelLabel', () => {
  beforeEach(() => {
    configure({
      throwSuggestions: true
    });
  });

  it('renders a title text', () => {
    render(<LabelLabel>Innholdtekst</LabelLabel>);

    const HeadingTitle = screen.getByText(/Innholdtekst/i);

    expect(HeadingTitle).toBeInTheDocument();
  });
});
