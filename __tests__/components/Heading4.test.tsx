import { render, screen } from '@testing-library/react';
import Heading4 from '../../components/Heading4/Heading4';

describe('Heading4', () => {
  it('renders a title text', () => {
    render(<Heading4>Innholdstekst</Heading4>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 4,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });
});
