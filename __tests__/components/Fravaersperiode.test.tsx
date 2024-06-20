import { render, screen } from '@testing-library/react';
import Fravaersperiode from '../../components/Fravaersperiode/Fravaersperiode';

describe('Fravaersperiode', () => {
  it('renders the heading', () => {
    render(<Fravaersperiode />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('Sykmelding');
  });

  it('renders the correct text when selvbestemtInnsending is false', () => {
    render(<Fravaersperiode />);
    const text = screen.getByText(/I følge sykmeldingen var den ansatte syk/i);
    expect(text).toBeInTheDocument();
  });

  it('renders the correct text when selvbestemtInnsending is true', () => {
    render(<Fravaersperiode selvbestemtInnsending />);
    const text = screen.getByText(/Dere har angitt sykmeldingsperiode vist under/i);
    expect(text).toBeInTheDocument();
  });

  // Add more tests as needed
});
