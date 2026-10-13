import { render, screen } from '@testing-library/react';
import ForlengetPeriodeInfo from '../../../components/Initiering/ForlengetPeriodeInfo';

const props = {
  arbeidsforhold: [],
  navn: 'Ada Nordmann',
  fnr: '01019012345',
  fomDato: '01.01.2024',
  tomDato: '31.01.2024'
};

describe('ForlengetPeriodeInfo', () => {
  it('renders person information as a link when href is provided', () => {
    render(<ForlengetPeriodeInfo {...props} href='/foresporsel/123' />);

    expect(screen.getByRole('link', { name: /Inntektsmelding Ada Nordmann/ })).toHaveAttribute(
      'href',
      '/foresporsel/123'
    );
    expect(screen.getByText(/Sykmeldingsperiode: 01\.01\.2024 - 31\.01\.2024/)).toBeInTheDocument();
  });

  it('renders person information without a link when href is missing', () => {
    render(<ForlengetPeriodeInfo {...props} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/Inntektsmelding Ada Nordmann/)).toBeInTheDocument();
    expect(screen.getByText(/Sykmeldingsperiode: 01\.01\.2024 - 31\.01\.2024/)).toBeInTheDocument();
  });
});
