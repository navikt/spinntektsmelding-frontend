import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Aarsaksvelger from '../../components/Bruttoinntekt/Aarsaksvelger';
import { expect, vi } from 'vitest';
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

const perioder = [{ fom: '2022-01-01', tom: '2022-01-05' }];

describe('Aarsaksvelger', () => {
  const changeMaanedsintektHandler = vi.fn();
  const changeBegrunnelseHandler = vi.fn();
  const clickTilbakestillMaanedsinntekt = vi.fn();
  const setEndringAarsakGjelderFra = vi.fn();
  const setEndringAarsakBleKjent = vi.fn();
  const visFeilmeldingsTekst = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the component', () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={undefined}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={vi.fn}
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
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={vi.fn}
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
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={vi.fn}
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
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={vi.fn}
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
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={vi.fn}
        nyInnsending={false}
      />
    );

    const user = userEvent.setup();
    const select = screen.getByLabelText('Velg endringsårsak');

    await user.selectOptions(select, 'Varig lønnsendring');

    expect(changeBegrunnelseHandler).toHaveBeenCalledWith('VarigLoennsendring');
  });

  it('calls the setEndringAarsakBleKjent function when the TariffendringDato component is used', async () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={{ bruttoInntekt: 1000, endringsaarsak: 'Tariffendring', manueltKorrigert: false }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={vi.fn}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Tariffendring', gjelderFra: '2022-01-01', bleKjent: '2022-01-01' }}
      />
    );

    await waitFor(() => screen.getByLabelText('Dato tariffendring ble kjent'));
    const input = screen.getByLabelText('Dato tariffendring ble kjent');
    userEvent.clear(input);
    userEvent.type(input, '2022-01-01');
    expect(setEndringAarsakBleKjent).toHaveBeenCalledTimes(1);

    const inputGjelderFra = screen.getByLabelText('Tariffendring gjelder fra');
    userEvent.clear(inputGjelderFra);
    userEvent.type(inputGjelderFra, '2022-01-01');
    expect(setEndringAarsakGjelderFra).toHaveBeenCalledTimes(1);
  });

  it.skip('calls the setPerioder function when the endringAarsak is ferie', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'Ferie', perioder: perioder },
          manueltKorrigert: false
        }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Ferie', perioder: perioder }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setPerioder).toHaveBeenCalledWith([
      {
        fom: parseIsoDate('2022-01-02'),
        id: '2022-01-01-2022-01-05',
        tom: parseIsoDate('2022-01-05')
      }
    ]);
  });

  it('calls the setPerioder function when the endringsaarsak is VarigLoennsendring', async () => {
    const setPerioder = vi.fn();
    const setEndringAarsakGjelderFra = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'VarigLoennsendring', gjelderFra: '2022-01-01' },
          manueltKorrigert: false
        }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'VarigLoennsendring', gjelderFra: '2022-01-01' }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText(/Lønnsendring gjelder fra/);
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setEndringAarsakGjelderFra).toHaveBeenCalledWith(parseIsoDate('2022-01-02'));
  });

  it('calls the setPerioder function when the endringsaarsak is Permisjon', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'Permisjon', perioder: perioder },
          manueltKorrigert: false
        }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Permisjon', perioder: perioder }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setPerioder).toHaveBeenCalledWith([
      {
        fom: parseIsoDate('2022-01-02'),
        id: '2022-01-01-2022-01-05',
        tom: parseIsoDate('2022-01-05')
      }
    ]);
  });

  it('calls the setPerioder function when the endringsaarsak is Permittering', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{ bruttoInntekt: 1000, endringsaarsak: 'Permittering', manueltKorrigert: false }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Permittering', perioder: perioder }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setPerioder).toHaveBeenCalledWith([
      {
        fom: parseIsoDate('2022-01-02'),
        id: '2022-01-01-2022-01-05',
        tom: parseIsoDate('2022-01-05')
      }
    ]);
  });

  it('calls the setPerioder function when the endringsaarsak is NyStilling', async () => {
    const setPerioder = vi.fn();
    const setEndringAarsakGjelderFra = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'NyStilling', gjelderFra: '2022-01-01' },
          manueltKorrigert: false
        }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'NyStilling', gjelderFra: '2022-01-01' }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText(/Ny stilling fra/);
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setEndringAarsakGjelderFra).toHaveBeenCalledWith(parseIsoDate('2022-01-02'));
  });

  it('calls the setPerioder function when the endringsaarsak is NyStillingsprosent', async () => {
    const setPerioder = vi.fn();
    const setEndringAarsakGjelderFra = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'NyStillingsprosent', gjelderFra: '2022-01-01' },
          manueltKorrigert: false
        }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'NyStillingsprosent', gjelderFra: '2022-01-01' }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText(/Ny stillingsprosent fra/);
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setEndringAarsakGjelderFra).toHaveBeenCalledWith(parseIsoDate('2022-01-02'));
  });

  it('calls the setPerioder function when the endringsaarsak is Sykefravaer', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{ bruttoInntekt: 1000, endringsaarsak: 'Sykefravaer', manueltKorrigert: false }}
        changeMaanedsintektHandler={changeMaanedsintektHandler}
        changeBegrunnelseHandler={changeBegrunnelseHandler}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        setEndringAarsakGjelderFra={setEndringAarsakGjelderFra}
        setEndringAarsakBleKjent={setEndringAarsakBleKjent}
        visFeilmeldingsTekst={visFeilmeldingsTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Sykefravaer', perioder: perioder }}
      />
    );

    const user = userEvent.setup();

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setPerioder).toHaveBeenCalledWith([
      {
        fom: parseIsoDate('2022-01-02'),
        id: '2022-01-01-2022-01-05',
        tom: parseIsoDate('2022-01-05')
      }
    ]);
  });
});
