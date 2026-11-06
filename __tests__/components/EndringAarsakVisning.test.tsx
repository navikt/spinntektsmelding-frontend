import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { expect } from 'vitest';
import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';
import parseIsoDate from '../../utils/parseIsoDate';
import type { ComponentProps } from 'react';

describe('EndringAarsakVisning', () => {
  it('should show tariffendringsdata.', async () => {
    const endrinAarsak = {
      aarsak: 'Tariffendring' as const,
      gjelderFra: parseIsoDate('2025-11-10')!,
      bleKjent: parseIsoDate('2025-11-15')!
    };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Tariffendring gjelder fra:/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/Dato tariffendring ble kjent:/)).toBeInTheDocument();
    expect(await screen.findByText(/15.11.2025/)).toBeInTheDocument();
  });

  it('should show ferie data.', async () => {
    const perioder = [
      { fom: '2025-11-10', tom: '2025-11-15' },
      { fom: '2025-12-10', tom: '2025-12-15' }
    ];
    const endrinAarsak = { aarsak: 'Ferie' as const, ferier: perioder };

    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Ferie fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Ferie til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2025/)).toBeInTheDocument();
  });

  it('should show VarigLonnsendring data.', async () => {
    const endrinAarsak = { aarsak: 'VarigLoennsendring' as const, gjelderFra: parseIsoDate('2025-12-15')! };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Varig lønnsendringsdato/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2025/)).toBeInTheDocument();
  });

  it('should show permisjon data.', async () => {
    const perioder = [
      { fom: '2025-11-10', tom: '2025-11-15' },
      { fom: '2025-12-10', tom: '2025-12-15' }
    ];
    const endrinAarsak = { aarsak: 'Permisjon' as const, permisjoner: perioder };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Permisjon fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Permisjon til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2025/)).toBeInTheDocument();
  });

  it('should show permitering data.', async () => {
    const perioder = [
      { fom: '2025-11-10', tom: '2025-11-15' },
      { fom: '2025-12-10', tom: '2025-12-15' }
    ];
    const endrinAarsak = { aarsak: 'Permittering' as const, permitteringer: perioder };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Permittering fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Permittering til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2025/)).toBeInTheDocument();
  });

  it('should show NyStilling.', async () => {
    const endrinAarsak = { aarsak: 'NyStilling' as const, gjelderFra: parseIsoDate('2025-11-10')! };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Ny stilling fra/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
  });

  it('should show NyStillingsprosent.', async () => {
    const endrinAarsak = { aarsak: 'NyStillingsprosent' as const, gjelderFra: parseIsoDate('2025-11-10')! };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Ny stillingsprosent fra/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
  });

  it('should show sykefravær data.', async () => {
    const perioder = [
      { fom: '2025-11-10', tom: '2025-11-15' },
      { fom: '2025-12-10', tom: '2025-12-15' }
    ];
    const endrinAarsak = { aarsak: 'Sykefravaer' as const, sykefravaer: perioder };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Sykefravær fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2025/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Sykefravær til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2025/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2025/)).toBeInTheDocument();
  });

  it('should show Feilregistrert data.', async () => {
    const endrinAarsak = { aarsak: 'Feilregistrert' as const };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Bonus data.', async () => {
    const endrinAarsak = { aarsak: 'Bonus' as const };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Nyansatt data.', async () => {
    const endrinAarsak = { aarsak: 'Nyansatt' as const };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show default data.', async () => {
    const endrinAarsak = { aarsak: 'Ukjent' as const };
    const { container } = render(
      <EndringAarsakVisning
        endringAarsak={endrinAarsak as unknown as ComponentProps<typeof EndringAarsakVisning>['endringAarsak']}
      />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Ferietrekk data.', async () => {
    const endrinAarsak = { aarsak: 'Nyansatt' as const };
    const { container } = render(<EndringAarsakVisning endringAarsak={endrinAarsak} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });
});
