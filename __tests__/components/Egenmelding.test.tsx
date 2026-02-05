import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import Egenmelding from '../../components/Egenmelding';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';

describe('Egenmelding', () => {
  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  it('should have no violations', async () => {
    const { container } = render(<Egenmelding egenmeldingsperioder={undefined} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show perioder when egenmeldingsperioder exist', async () => {
    const perioder = [
      { fom: parseIsoDate('2022-06-06'), tom: parseIsoDate('2022-07-06'), id: '1' },
      { fom: parseIsoDate('2022-08-06'), tom: parseIsoDate('2022-09-06'), id: '2' },
      { fom: parseIsoDate('2022-10-06'), tom: parseIsoDate('2022-11-06'), id: '3' }
    ];

    const { container } = render(<Egenmelding egenmeldingsperioder={perioder} />);

    expect(screen.getByText('Egenmelding')).toBeInTheDocument();
    expect(screen.getByText('06.06.2022')).toBeInTheDocument();
    expect(screen.getByText('06.07.2022')).toBeInTheDocument();
    expect(screen.getByText('06.08.2022')).toBeInTheDocument();
    expect(screen.getByText('06.09.2022')).toBeInTheDocument();
    expect(screen.getByText('06.10.2022')).toBeInTheDocument();
    expect(screen.getByText('06.11.2022')).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show message when there are no egenmeldingsperioder', async () => {
    const { container } = render(<Egenmelding egenmeldingsperioder={undefined} />);

    expect(
      screen.getByText('Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.')
    ).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show message when egenmeldingsperioder is an empty array', async () => {
    const { container } = render(<Egenmelding egenmeldingsperioder={[]} />);

    expect(
      screen.getByText('Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.')
    ).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show loader when lasterData is true', async () => {
    const { container } = render(<Egenmelding lasterData={true} egenmeldingsperioder={undefined} />);

    expect(screen.getByText('Egenmelding')).toBeInTheDocument();
    // EgenmeldingLoader should be rendered, not the perioder or empty message
    expect(
      screen.queryByText('Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.')
    ).not.toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should display Fra and Til labels for each periode', async () => {
    const perioder = [{ fom: parseIsoDate('2023-01-01'), tom: parseIsoDate('2023-01-15'), id: '1' }];

    render(<Egenmelding egenmeldingsperioder={perioder} />);

    expect(screen.getByText('Fra')).toBeInTheDocument();
    expect(screen.getByText('Til')).toBeInTheDocument();
    expect(screen.getByText('01.01.2023')).toBeInTheDocument();
    expect(screen.getByText('15.01.2023')).toBeInTheDocument();
  });

  it('should show multiple Fra/Til labels for multiple perioder', async () => {
    const perioder = [
      { fom: parseIsoDate('2023-01-01'), tom: parseIsoDate('2023-01-15'), id: '1' },
      { fom: parseIsoDate('2023-02-01'), tom: parseIsoDate('2023-02-15'), id: '2' }
    ];

    render(<Egenmelding egenmeldingsperioder={perioder} />);

    const fraLabels = screen.getAllByText('Fra');
    const tilLabels = screen.getAllByText('Til');

    expect(fraLabels).toHaveLength(2);
    expect(tilLabels).toHaveLength(2);
  });
});
