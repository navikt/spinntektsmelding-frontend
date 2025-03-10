import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Aarsaksvelger from '../../components/Bruttoinntekt/Aarsaksvelger';
import { expect, vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';
import { FormProvider, useForm } from 'react-hook-form';

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

vi.mock('react-hook-form', () => ({
  useController: () => ({
    // field: { value: 'test' },
    formState: { errors: {} }
  }),
  useFieldArray: () => ({
    fields: [{}],
    append: vi.fn(),
    remove: vi.fn(),
    replace: vi.fn()
  }),
  useFormContext: () => ({
    handleSubmit: () => vi.fn(),
    control: {
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      _names: {
        array: new Set('test'),
        mount: new Set('test'),
        unMount: new Set('test'),
        watch: new Set('test'),
        focus: 'test',
        watchAll: false
      },
      _subjects: {
        watch: vi.fn(),
        array: vi.fn(),
        state: vi.fn()
      },
      _getWatch: vi.fn(),
      _formValues: ['test'],
      _defaultValues: ['test']
    },
    getValues: () => {
      return [];
    },
    setValue: () => vi.fn(),
    formState: () => vi.fn(),
    watch: () => vi.fn(),
    register: vi.fn()
  }),
  Controller: () => [],
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => vi.fn() } } }
  })
}));

describe('Aarsaksvelger', () => {
  const changeMaanedsintektHandler = vi.fn();
  const changeBegrunnelseHandler = vi.fn();
  const clickTilbakestillMaanedsinntekt = vi.fn();

  const visFeilmeldingTekst = vi.fn();

  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the component', () => {
    render(
      <Aarsaksvelger
        defaultEndringAarsak={{ aarsak: 'Bonus' }}
        bruttoinntekt={undefined}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        nyInnsending={false}
      />
    );
    expect(screen.getByLabelText('Månedslønn')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Tilbakestill/i
      })
    ).toBeInTheDocument();
  });

  it.skip('calls the changeMaanedsintektHandler function when the input value changes', async () => {
    render(
      <Aarsaksvelger
        defaultEndringAarsak={{ aarsak: 'Bonus' }}
        bruttoinntekt={undefined}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        nyInnsending={false}
      />
    );

    const input = screen.getByLabelText(/edslønn/);
    expect(input).toBeInTheDocument();

    await user.type(input, '20000');
    expect(changeMaanedsintektHandler).toHaveBeenCalledTimes(5);
  });

  it.skip('calls the changeBegrunnelseHandler function when the select value changes', async () => {
    render(
      <Aarsaksvelger
        defaultEndringAarsak={{ aarsak: 'Bonus' }}
        bruttoinntekt={undefined}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        nyInnsending={false}
      />
    );

    const select = screen.getByLabelText('Velg endringsårsak');
    await user.selectOptions(select, 'Bonus');
    expect(changeBegrunnelseHandler).toHaveBeenCalledTimes(1);
    expect(changeBegrunnelseHandler).toHaveBeenCalledWith('Bonus');
  });

  it.skip('calls the clickTilbakestillMaanedsinntekt function when the button is clicked', () => {
    render(
      <Aarsaksvelger
        defaultEndringAarsak={{ aarsak: 'Bonus' }}
        bruttoinntekt={undefined}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        nyInnsending={false}
      />
    );
    const button = screen.getByRole('button', {
      name: /Tilbakestill/i
    });
    button.click();
    expect(clickTilbakestillMaanedsinntekt).toHaveBeenCalledTimes(1);
  });

  it.skip('calls the changeBegrunnelseHandler function when the Varig lønnsendring is selected', async () => {
    render(
      <Aarsaksvelger
        defaultEndringAarsak={{ aarsak: 'Bonus' }}
        bruttoinntekt={undefined}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        nyInnsending={false}
      />
    );

    const select = screen.getByLabelText('Velg endringsårsak');

    await user.selectOptions(select, 'Varig lønnsendring');

    expect(changeBegrunnelseHandler).toHaveBeenCalledWith('VarigLoennsendring');
  });

  it.skip('calls the setPerioder function when the endringAarsak is ferie', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'Ferie', ferier: perioder },
          manueltKorrigert: false
        }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Ferie', ferier: perioder }}
      />
    );

    const input = screen.getByLabelText('Ferie fra');
    await user.clear(input);
    await user.type(input, '02.01.2022');

    const input2 = screen.getByLabelText('Ferie fra');
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

  it.skip('calls the setPerioder function when the endringsaarsak is VarigLoennsendring', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'VarigLoennsendring', gjelderFra: '2022-01-01' },
          manueltKorrigert: false
        }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'VarigLoennsendring', gjelderFra: '2022-01-01' }}
      />
    );

    const input = screen.getByLabelText(/Lønnsendring gjelder fra/);
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, '02.01.2022');
  });

  it.skip('calls the setPerioder function when the endringsaarsak is Permisjon', async () => {
    const setPerioderMock = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'Permisjon', permisjoner: perioder },
          manueltKorrigert: false
        }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioderMock}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Permisjon', permisjoner: perioder }}
      />
    );

    const input = screen.getByLabelText('Permisjon fra');
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

  it.skip('calls the setPerioder function when the endringsaarsak is Permittering', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{ bruttoInntekt: 1000, endringsaarsak: 'Permittering', manueltKorrigert: false }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Permittering', permitteringer: perioder }}
      />
    );

    const input = screen.getByLabelText('Permittering fra');
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

  it.skip('calls the setPerioder function when the endringsaarsak is NyStilling', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'NyStilling', gjelderFra: '2022-01-01' },
          manueltKorrigert: false
        }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'NyStilling', gjelderFra: '2022-01-01' }}
      />
    );

    const input = screen.getByLabelText(/Ny stilling fra/);
    await user.clear(input);
    await user.type(input, '02.01.2022');
  });

  it.skip('calls the setPerioder function when the endringsaarsak is NyStillingsprosent', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'NyStillingsprosent', gjelderFra: '2022-01-01' },
          manueltKorrigert: false
        }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'NyStillingsprosent', gjelderFra: '2022-01-01' }}
      />
    );

    const input = screen.getByLabelText(/Ny stillingsprosent fra/);
    await user.clear(input);
    await user.type(input, '02.01.2022');
  });

  it.skip('calls the setPerioder function when the endringsaarsak is Sykefravaer', async () => {
    const setPerioder = vi.fn();

    render(
      <Aarsaksvelger
        bruttoinntekt={{
          bruttoInntekt: 1000,
          endringAarsak: { aarsak: 'Sykefravaer', sykefravaer: perioder },
          manueltKorrigert: false
        }}
        clickTilbakestillMaanedsinntekt={clickTilbakestillMaanedsinntekt}
        visFeilmeldingTekst={visFeilmeldingTekst}
        setPerioder={setPerioder}
        nyInnsending={false}
        defaultEndringAarsak={{ aarsak: 'Sykefravaer', sykefravaer: perioder }}
      />
    );

    const input = screen.getByLabelText('Sykefravær fra');
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
