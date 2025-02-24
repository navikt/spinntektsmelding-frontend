import { render, screen } from '@testing-library/react';
import Fravaersperiode from '../../components/Fravaersperiode/Fravaersperiode';

const setIsDirtyMock = vi.fn();

describe('Fravaersperiode', () => {
  it('renders the heading', () => {
    render(<Fravaersperiode setIsDirtyForm={setIsDirtyMock} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('Sykmeldingsperiode');
  });

  it.skip('renders the correct text when selvbestemtInnsending is false', () => {
    render(<Fravaersperiode setIsDirtyForm={setIsDirtyMock} />);
    const text = screen.getByText(/I følge sykmeldingen var den ansatte syk/i);
    expect(text).toBeInTheDocument();
  });

  it.skip('renders the correct text when selvbestemtInnsending is true', () => {
    render(<Fravaersperiode selvbestemtInnsending setIsDirtyForm={setIsDirtyMock} />);
    const text = screen.getByText(/Du har angitt sykmeldingsperiode vist under/i);
    expect(text).toBeInTheDocument();
  });

  // Add more tests as needed
});
