import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Utgatt from '../../../pages/utgatt';
import environment from '../../../config/environment';

vi.spyOn(environment, 'saksoversiktUrl', 'get').mockReturnValue('https://mocked.nav.no');
vi.spyOn(environment, 'minSideArbeidsgiver', 'get').mockReturnValue('https://mocked.nav.no');

describe('Utgatt Page', () => {
  it('renders the heading', () => {
    render(<Utgatt />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Saken er utgått');
  });

  it('renders the body text', () => {
    render(<Utgatt />);
    const bodyText = screen.getByText(
      'Nav har ikke lenger behov for at du sender inn opplysninger i akkurat denne saken.'
    );
    expect(bodyText).toBeInTheDocument();
  });

  it('renders the link to saksoversikten', () => {
    render(<Utgatt />);
    const link = screen.getByRole('link', { name: /Gå til saksoversikten for å finne dine saker./i });
    expect(link).toHaveAttribute('href', environment.saksoversiktUrl);
  });

  it('renders the button to Min side', () => {
    render(<Utgatt />);
    const button = screen.getByRole('button', { name: /Gå til Min side/i });
    expect(button).toHaveAttribute('href', environment.minSideArbeidsgiver);
  });
});
