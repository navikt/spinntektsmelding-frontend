import { configure, render, screen } from '@testing-library/react';
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
});
