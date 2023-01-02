import { configure, render, screen } from '@testing-library/react';
import LabelLabel from '../../components/LabelLabel';

describe('LabelLabel', () => {
  beforeEach(() => {
    configure({
      throwSuggestions: true
    });
  });

  it('renders a title text', () => {
    render(<LabelLabel>Innholdstekst</LabelLabel>);

    const HeadingTitle = screen.getByText(/Innholdstekst/i);

    expect(HeadingTitle).toBeInTheDocument();
  });
});
