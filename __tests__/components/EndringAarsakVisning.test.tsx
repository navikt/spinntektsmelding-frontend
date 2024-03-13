import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import EndringAarsakVisning from '../../components/EndringAarsakVisning/EndringAarsakVisning';

describe('EndringAarsakVisning', () => {
  it('should show tariffendringsdata.', async () => {
    const { container } = render(
      <EndringAarsakVisning
        endringsaarsak={'Tariffendring'}
        tariffendringDato={new Date(2022, 10, 10)}
        tariffkjentdato={new Date(2022, 10, 15)}
      />
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
      { fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 15), id: '1' },
      { fom: new Date(2022, 11, 10), tom: new Date(2022, 11, 15), id: '2' }
    ];
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Ferie'} ferie={perioder} />);
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
    const { container } = render(
      <EndringAarsakVisning endringsaarsak={'VarigLoennsendring'} lonnsendringsdato={new Date(2022, 11, 15)} />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Varig lønnsendringsdato/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show permisjon data.', async () => {
    const perioder = [
      { fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 15), id: '1' },
      { fom: new Date(2022, 11, 10), tom: new Date(2022, 11, 15), id: '2' }
    ];
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Permisjon'} permisjon={perioder} />);
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
      { fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 15), id: '1' },
      { fom: new Date(2022, 11, 10), tom: new Date(2022, 11, 15), id: '2' }
    ];
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Permittering'} permittering={perioder} />);
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
    const { container } = render(
      <EndringAarsakVisning endringsaarsak={'NyStilling'} nystillingdato={new Date(2022, 10, 10)} />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Ny stilling fra/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
  });

  it('should show NyStillingsprosent.', async () => {
    const { container } = render(
      <EndringAarsakVisning endringsaarsak={'NyStillingsprosent'} nystillingsprosentdato={new Date(2022, 10, 10)} />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(await screen.findByText(/Ny stillingsprosent fra/)).toBeInTheDocument();
    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();
  });

  it('should show sykefravær data.', async () => {
    const perioder = [
      { fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 15), id: '1' },
      { fom: new Date(2022, 11, 10), tom: new Date(2022, 11, 15), id: '2' }
    ];
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Sykefravaer'} sykefravaer={perioder} />);
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
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Feilregistrert'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Bonus data.', async () => {
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Bonus'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Nyansatt data.', async () => {
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Nyansatt'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show default data.', async () => {
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Ukjent'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });

  it('should show Ferietrekk data.', async () => {
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Nyansatt'} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    expect(container).toBeEmptyDOMElement();
  });
});
