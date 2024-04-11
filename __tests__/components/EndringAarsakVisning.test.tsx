import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { expect } from 'vitest';
import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';

describe('EndringAarsakVisning', () => {
  it('should show tariffendringsdata.', async () => {
    const { container } = render(
      <EndringAarsakVisning aarsak={'Tariffendring'} gjelderFra={'2022-11-10'} bleKjent={'2022-11-15'} />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Tariffendring gjelder fra:/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/Dato tariffendring ble kjent:/)).toBeInTheDocument();
    expect(await screen.findByText(/15.11.2022/)).toBeInTheDocument();
  });

  it('should show ferie data.', async () => {
    const perioder = [
      { fom: '2022-11-10', tom: '2022-11-15' },
      { fom: '2022-12-10', tom: '2022-12-15' }
    ];
    const { container } = render(<EndringAarsakVisning aarsak={'Ferie'} perioder={perioder} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show VarigLonnsendring data.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'VarigLoennsendring'} gjelderFra={'2022-12-15'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Varig lønnsendringsdato/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show permisjon data.', async () => {
    const perioder = [
      { fom: '2022-11-10', tom: '2022-11-15' },
      { fom: '2022-12-10', tom: '2022-12-15' }
    ];
    const { container } = render(<EndringAarsakVisning aarsak={'Permisjon'} perioder={perioder} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show permitering data.', async () => {
    const perioder = [
      { fom: '2022-11-10', tom: '2022-11-15' },
      { fom: '2022-12-10', tom: '2022-12-15' }
    ];
    const { container } = render(<EndringAarsakVisning aarsak={'Permittering'} perioder={perioder} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show NyStilling.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'NyStilling'} gjelderFra={'2022-11-10'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Ny stilling fra/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
  });

  it('should show NyStillingsprosent.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'NyStillingsprosent'} gjelderFra={'2022-11-10'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Ny stillingsprosent fra/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
  });

  it('should show sykefravær data.', async () => {
    const perioder = [
      { fom: '2022-11-10', tom: '2022-11-15' },
      { fom: '2022-12-10', tom: '2022-12-15' }
    ];
    const { container } = render(<EndringAarsakVisning aarsak={'Sykefravaer'} perioder={perioder} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findAllByText(/Fra/)).toHaveLength(2);
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
    expect(await screen.findAllByText(/Til/)).toHaveLength(2);
    expect(await screen.findByText(/15.11.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show Feilregistrert data.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'Feilregistrert'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Bonus data.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'Bonus'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Nyansatt data.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'Nyansatt'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show default data.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'Ukjent'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Ferietrekk data.', async () => {
    const { container } = render(<EndringAarsakVisning aarsak={'Nyansatt'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });
});
