import { render, screen } from '@testing-library/react';
import Heading3 from '../../components/Heading3/Heading3';

describe('Heading3', () => {
  it('renders a title text', () => {
    render(<Heading3>Innholdstekst</Heading3>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('still renders a title text', () => {
    render(<Heading3 className='Test'>Innholdstekst</Heading3>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
    expect(HeadingTitle).toHaveClass('Test');
  });

  it('renders without padding when unPadded is true', () => {
    render(<Heading3 unPadded>Innholdstekst</Heading3>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('renders with top padding when topPadded is true', () => {
    render(<Heading3 topPadded>Innholdstekst</Heading3>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('renders with both unPadded and topPadded props', () => {
    render(
      <Heading3 unPadded topPadded>
        Innholdstekst
      </Heading3>
    );

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });
});
