import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';
import { LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from '../../state/state';
import { EndringsBeloep } from '../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import parseIsoDate from '../../utils/parseIsoDate';

describe('LonnUnderSykefravaeret', () => {
  it('renders a title text', async () => {
    const loenn: LonnISykefravaeret = { status: 'Ja', beloep: 1234 };
    const refusjonEndringer: Array<EndringsBeloep> = [
      { dato: parseIsoDate('2022-02-02'), beloep: 1234 },
      { dato: parseIsoDate('2022-03-03'), beloep: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        loenn={loenn}
        harRefusjonEndringer={'Ja'}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={{ status: 'Nei' }}
      />
    );

    // const { container } = render(<LonnUnderSykefravaeret loenn={loenn} refusjonEndringer={refusjonEndringer} />);
    // { dato: parseIsoDate('2022-03-03'), beloep: 432 } />);

    const HeadingTitle = screen.getByText(/NAV vil refundere opp/);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders a title text and refusjon endringer', async () => {
    const loenn: LonnISykefravaeret = { status: 'Ja', beloep: 2345 };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = { status: 'Nei' };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBeloep> = [
      { dato: parseIsoDate('2022-02-02'), beloep: 1234 },
      { dato: parseIsoDate('2022-03-03'), beloep: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        loenn={loenn}
        harRefusjonEndringer={harRefusjonEndringer}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={refusjonskravetOpphoerer}
      />
    );

    const HeadingTitle = screen.getByText(/NAV vil refundere opp/);

    expect(HeadingTitle).toBeInTheDocument();

    const tall = screen.getByText(/432/);

    expect(tall).toBeInTheDocument();

    const tallto = screen.getByText(/1?234/);

    expect(tallto).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders a title text and refusjon endringer with an end date', async () => {
    const loenn: LonnISykefravaeret = { status: 'Ja', beloep: 2345 };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja',
      opphoersdato: parseIsoDate('2022-04-04')
    };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBeloep> = [
      { dato: parseIsoDate('2022-02-02'), beloep: 1234 },
      { dato: parseIsoDate('2022-03-03'), beloep: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        loenn={loenn}
        harRefusjonEndringer={harRefusjonEndringer}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={refusjonskravetOpphoerer}
      />
    );

    const littTekst = screen.getByText(/Opphørsdato/);

    expect(littTekst).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders a title text and refusjon endringer with an end date', async () => {
    const loenn: LonnISykefravaeret = { beloep: 2345, status: 'Nei' };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja',
      opphoersdato: parseIsoDate('2022-04-04')
    };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBeloep> = [
      { dato: parseIsoDate('2022-02-02'), beloep: 1234 },
      { dato: parseIsoDate('2022-03-03'), beloep: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        loenn={loenn}
        harRefusjonEndringer={harRefusjonEndringer}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={refusjonskravetOpphoerer}
      />
    );

    const littTekst = screen.getByText(/Nei/);

    expect(littTekst).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders a title text without refusjon endringer', async () => {
    const loenn: LonnISykefravaeret = { status: 'Ja', beloep: 2345 };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja',
      opphoersdato: parseIsoDate('2022-04-04')
    };
    const harRefusjonEndringer: YesNo = 'Nei';
    const refusjonEndringer: Array<EndringsBeloep> = [
      { dato: parseIsoDate('2022-02-02'), beloep: 1234 },
      { dato: parseIsoDate('2022-03-03'), beloep: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        loenn={loenn}
        harRefusjonEndringer={harRefusjonEndringer}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={refusjonskravetOpphoerer}
      />
    );

    const littTekst = screen.getByText(/Er det endringer i refusjonsbeløpet i perioden/);

    expect(littTekst).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('dont render a title text without refusjon endringer', async () => {
    const loenn: LonnISykefravaeret = { status: 'Ja', beloep: 2345 };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja',
      opphoersdato: parseIsoDate('2022-04-04')
    };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBeloep> = [
      { dato: parseIsoDate('2022-02-02'), beloep: 1234 },
      { dato: parseIsoDate('2022-03-03'), beloep: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        loenn={loenn}
        harRefusjonEndringer={harRefusjonEndringer}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={refusjonskravetOpphoerer}
      />
    );

    const littTekst = screen.queryByText(/Er det endringer i refusjonsbeløpet i perioden/);

    expect(littTekst).not.toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
