import { render, screen } from '@testing-library/react';
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

const perioder = [{ fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-05') }];

describe('Aarsaksvelger', () => {
  const changeMaanedsintektHandler = vi.fn();
  const changeBegrunnelseHandler = vi.fn();
  const clickTilbakestillMaanedsinntekt = vi.fn();
  const setEndringAarsakGjelderFra = vi.fn();
  const setEndringAarsakBleKjent = vi.fn();
  const visFeilmeldingsTekst = vi.fn();

  const user = userEvent.setup();

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

    const select = screen.getByLabelText('Velg endringsårsak');

    await user.selectOptions(select, 'Varig lønnsendring');

    expect(changeBegrunnelseHandler).toHaveBeenCalledWith('VarigLoennsendring');
  });

  it('calls the setEndringAarsakBleKjent function when the TariffendringDato component is used', async () => {
    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'Tariffendring', gjelderFra: '2022-01-01', bleKjent: '2022-01-01' },
          manueltKorrigert: false
        }}
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

    const inputGjelderFra = screen.getByLabelText(/Tariffendring gjelder fra/);
    await user.clear(inputGjelderFra);
    await user.type(inputGjelderFra, '10.01.2022');
    expect(setEndringAarsakGjelderFra).toHaveBeenCalledWith(parseIsoDate('2022-01-10'));

    const input = screen.getByLabelText('Dato tariffendring ble kjent');
    await user.clear(input);
    await user.type(input, '01.01.2022');
    expect(setEndringAarsakBleKjent).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });

  it('calls the setPerioder function when the endringAarsak is ferie', async () => {
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
        defaultEndringAarsak={{ aarsak: 'Ferie', ferier: perioder }}
      />
    );

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');

    const input2 = screen.getByLabelText('Fra');
    await user.clear(input2);
    await user.type(input2, '05.01.2022');

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

    const input = screen.getByLabelText(/Lønnsendring gjelder fra/);
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setEndringAarsakGjelderFra).toHaveBeenCalledWith(parseIsoDate('2022-01-02'));
  });

  it('calls the setPerioder function when the endringsaarsak is Permisjon', async () => {
    const setPerioderMock = vi.fn();

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
        setPerioder={setPerioderMock}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Permisjon', permisjoner: perioder }}
      />
    );

    const input = screen.getByLabelText('Fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');
    expect(setPerioderMock).toHaveBeenCalledWith([
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
        defaultEndringAarsak={{ aarsak: 'Permittering', permitteringer: perioder }}
      />
    );

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
        defaultEndringAarsak={{ aarsak: 'Sykefravaer', sykefravaer: perioder }}
      />
    );

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
