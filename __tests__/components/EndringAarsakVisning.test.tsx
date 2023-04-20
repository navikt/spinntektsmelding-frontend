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

    const tekst = await screen.findByText(/Tariffendring gjelder fra:/);

    expect(tekst).toBeInTheDocument();

    const tekst2 = await screen.findByText(/10.11.2022/);

    expect(tekst2).toBeInTheDocument();

    const tekst3 = await screen.findByText(/Dato tariffendring ble kjent:/);

    expect(tekst3).toBeInTheDocument();

    const tekst4 = await screen.findByText(/15.11.2022/);

    expect(tekst4).toBeInTheDocument();
  });

  it('should show ferie data.', async () => {
    const perioder = [
      { fom: new Date(2022, 10, 10), tom: new Date(2022, 10, 15), id: '1' },
      { fom: new Date(2022, 11, 10), tom: new Date(2022, 11, 15), id: '2' }
    ];
    const { container } = render(<EndringAarsakVisning endringsaarsak={'Ferie'} ferie={perioder} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    const tekst = await screen.findAllByText('Fra');

    expect(tekst).toHaveLength(2);

    expect(await screen.findByText(/10.11.2022/)).toBeInTheDocument();

    expect(await screen.findAllByText(/Til/)).toHaveLength(2);

    expect(await screen.findByText(/15.11.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/10.12.2022/)).toBeInTheDocument();
    expect(await screen.findByText(/15.12.2022/)).toBeInTheDocument();
  });

  it('should show VarigLonnsendring data.', async () => {
    const { container } = render(
      <EndringAarsakVisning endringsaarsak={'VarigLonnsendring'} lonnsendringsdato={new Date(2022, 11, 15)} />
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

    const tekst = await screen.findAllByText('Fra');

    expect(tekst).toHaveLength(2);

    const tekst2 = await screen.findByText(/10.11.2022/);

    expect(tekst2).toBeInTheDocument();

    const tekst3 = await screen.findAllByText(/Til/);

    expect(tekst3).toHaveLength(2);

    const tekst4 = await screen.findByText(/15.11.2022/);

    expect(tekst4).toBeInTheDocument();
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

    const tekst = await screen.findAllByText('Fra');

    expect(tekst).toHaveLength(2);

    const tekst2 = await screen.findByText(/10.11.2022/);

    expect(tekst2).toBeInTheDocument();

    const tekst3 = await screen.findAllByText(/Til/);

    expect(tekst3).toHaveLength(2);

    const tekst4 = await screen.findByText(/15.11.2022/);

    expect(tekst4).toBeInTheDocument();
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
});
