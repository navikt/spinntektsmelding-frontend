import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Fravaersperiode from '../../../components/kvittering/Fravaersperiode';

const setIsDirtyMock = vi.fn();

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

  it('does not render egenmeldingsperioder when undefined', () => {
    render(<Fravaersperiode paakrevdeOpplysninger={[]} />);
    const heading = screen.queryByRole('heading', { name: 'Egenmelding' });
    expect(heading).not.toBeInTheDocument();
  });

  it('does not render egenmeldingsperioder when empty array', () => {
    render(<Fravaersperiode paakrevdeOpplysninger={[]} egenmeldingsperioder={[]} />);
    const heading = screen.queryByRole('heading', { name: 'Egenmelding' });
    expect(heading).not.toBeInTheDocument();
  });

  it('does not render egenmeldingsperioder when periods have no fom or tom', () => {
    const egenmeldingsperioder = [{ id: '1', fom: undefined, tom: undefined }];
    render(<Fravaersperiode paakrevdeOpplysninger={[]} egenmeldingsperioder={egenmeldingsperioder} />);
    const heading = screen.queryByRole('heading', { name: 'Egenmelding' });
    expect(heading).not.toBeInTheDocument();
  });

  it('renders sykmeldingsperioder', () => {
    const sykmeldingsperioder = [
      { id: '1', fom: '2024-01-01', tom: '2024-01-05' },
      { id: '2', fom: '2024-01-10', tom: '2024-01-15' }
    ];
    render(<Fravaersperiode paakrevdeOpplysninger={[]} sykmeldingsperioder={sykmeldingsperioder} />);
    const heading = screen.getByRole('heading', { name: 'Sykmelding' });
    expect(heading).toBeInTheDocument();
  });

  it('renders egenmeldingsperioder when only fom is set', () => {
    const egenmeldingsperioder = [{ id: '1', fom: '2024-01-01', tom: undefined }];
    render(<Fravaersperiode paakrevdeOpplysninger={[]} egenmeldingsperioder={egenmeldingsperioder} />);
    const heading = screen.getByRole('heading', { name: 'Egenmelding' });
    expect(heading).toBeInTheDocument();
  });

  it('renders egenmeldingsperioder when only tom is set', () => {
    const egenmeldingsperioder = [{ id: '1', fom: undefined, tom: '2024-01-05' }];
    render(<Fravaersperiode paakrevdeOpplysninger={[]} egenmeldingsperioder={egenmeldingsperioder} />);
    const heading = screen.getByRole('heading', { name: 'Egenmelding' });
    expect(heading).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const sykmeldingsperioder = [
      { id: '1', fom: '2024-01-01', tom: '2024-01-05' },
      { id: '2', fom: '2024-01-10', tom: '2024-01-15' }
    ];
    const { container } = render(
      <Fravaersperiode paakrevdeOpplysninger={[]} sykmeldingsperioder={sykmeldingsperioder} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
