import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Aarsaksvelger from '../../components/Bruttoinntekt/Aarsaksvelger';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn()
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
vi.stubGlobal('ResizeObserver', IntersectionObserverMock);

describe('Aarsaksvelger', () => {
  const changeMaanedsintektHandler = vi.fn();
  const changeBegrunnelseHandler = vi.fn();
  const clickTilbakestillMaanedsinntekt = vi.fn();
  const setTariffEndringsdato = vi.fn();
  const setTariffKjentdato = vi.fn();
  const visFeilmeldingsTekst = vi.fn();

  it('renders the component', () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={undefined}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={vi.fn}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
      />
    );
    expect(screen.getByLabelText('Månedsinntekt')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Tilbakestill/i
      })
    ).toBeInTheDocument();
  });

  it('calls the changeMaanedsintektHandler function when the input value changes', async () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={undefined}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={vi.fn}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
      />
    );
    const user = userEvent.setup();
    const input = screen.getByLabelText(/edsinntekt/);
    await user.type(input, '20000');
    expect(changeMaanedsintektHandler).toHaveBeenCalledTimes(5);
  });

  it('calls the changeBegrunnelseHandler function when the select value changes', async () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={undefined}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={vi.fn}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
      />
    );
    const user = userEvent.setup();

    const select = screen.getByLabelText('Velg endringsårsak');
    await user.selectOptions(select, 'Bonus');
    expect(changeBegrunnelseHandler).toHaveBeenCalledTimes(1);
    expect(changeBegrunnelseHandler).toHaveBeenCalledWith('Bonus');
  });

  it('calls the clickTilbakestillMaanedsinntekt function when the button is clicked', () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={undefined}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={vi.fn}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
      />
    );
    const button = screen.getByRole('button', {
      name: /Tilbakestill/i
    });
    button.click();
    expect(clickTilbakestillMaanedsinntekt).toHaveBeenCalledTimes(1);
  });

  it('calls the changeBegrunnelseHandler function when the Varig lønnsendring is selected', async () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={undefined}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={vi.fn}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
      />
    );

    const user = userEvent.setup();
    const select = screen.getByLabelText('Velg endringsårsak');

    await user.selectOptions(select, 'Varig lønnsendring');

    expect(changeBegrunnelseHandler).toHaveBeenCalledWith('VarigLonnsendring');
  });

  it('calls the setTariffKjentdato function when the TariffendringDato component is used', async () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={{ bruttoInntekt: 1000, endringsaarsak: 'Tariffendring', manueltKorrigert: false }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={vi.fn}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
      />
    );

    const user = userEvent.setup();

    await waitFor(() => screen.getByLabelText('Dato tariffendring ble kjent'));
    const input = screen.getByLabelText('Dato tariffendring ble kjent');
    userEvent.clear(input);
    userEvent.type(input, '2022-01-01');
    expect(setTariffKjentdato).toHaveBeenCalledTimes(1);

    const inputGjelderFra = screen.getByLabelText('Tariffendring gjelder fra');
    userEvent.clear(inputGjelderFra);
    userEvent.type(inputGjelderFra, '2022-01-01');
    expect(setTariffEndringsdato).toHaveBeenCalledTimes(1);
  });

  it.skip('calls the setFeriePeriode function when the endringsaarsak is ferie', async () => {
    const setFeriePeriode = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{ bruttoInntekt: 1000, endringsaarsak: 'Ferie', manueltKorrigert: false }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        tariffendringDato={new Date()}
        tariffkjentdato={new Date()}
        setTariffEndringsdato={setTariffEndringsdato}
        setTariffKjentdato={setTariffKjentdato}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setFeriePeriode={setFeriePeriode}
        setPermisjonPeriode={vi.fn}
        setPermitteringPeriode={vi.fn}
        setNyStillingDato={vi.fn}
        setNyStillingsprosentDato={vi.fn}
        setLonnsendringDato={vi.fn}
        setSykefravaerPeriode={vi.fn}
        nyInnsending={false}
        ferie={[{ fom: undefined, tom: undefined, id: '1' }]}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.02.2022');
    expect(setFeriePeriode).toHaveBeenCalledWith([
      {
        fom: parseIsoDate('2022-02-02'),
        id: '1',
        tom: undefined
      }
    ]);
  });
});
