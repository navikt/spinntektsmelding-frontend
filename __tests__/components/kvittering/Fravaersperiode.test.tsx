import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Fravaersperiode from '../../../components/kvittering/Fravaersperiode';
import { Periode } from '../../../state/state';
import parseIsoDate from '../../../utils/parseIsoDate';

describe('Fravaersperiode', () => {
  it('renders Fraværsperiode heading', () => {
    render(<Fravaersperiode paakrevdeOpplysninger={[]} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Fraværsperiode');
  });

  it('renders Sykmelding heading', () => {
    render(<Fravaersperiode paakrevdeOpplysninger={[]} />);
    const heading = screen.getByRole('heading', { name: 'Sykmelding' });
    expect(heading).toBeInTheDocument();
  });

  it('renders sykmeldingsperioder', () => {
    const sykmeldingsperioder: Periode[] = [
      { id: '1', fom: parseIsoDate('2024-01-01'), tom: parseIsoDate('2024-01-05') },
      { id: '2', fom: parseIsoDate('2024-01-10'), tom: parseIsoDate('2024-01-15') }
    ];
    render(<Fravaersperiode paakrevdeOpplysninger={[]} sykmeldingsperioder={sykmeldingsperioder} />);
    const heading = screen.getByRole('heading', { name: 'Sykmelding' });
    expect(heading).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const sykmeldingsperioder: Periode[] = [
      { id: '1', fom: parseIsoDate('2024-01-01'), tom: parseIsoDate('2024-01-05') },
      { id: '2', fom: parseIsoDate('2024-01-10'), tom: parseIsoDate('2024-01-15') }
    ];
    const { container } = render(
      <Fravaersperiode paakrevdeOpplysninger={[]} sykmeldingsperioder={sykmeldingsperioder} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
