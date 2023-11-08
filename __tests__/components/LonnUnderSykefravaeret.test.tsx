import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import LonnUnderSykefravaeret from '../../components/LonnUnderSykefravaeret/LonnUnderSykefravaeret';
import { LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from '../../state/state';
import { EndringsBelop } from '../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import parseIsoDate from '../../utils/parseIsoDate';

describe('LonnUnderSykefravaeret', () => {
  it('renders a title text', async () => {
    const lonn: LonnISykefravaeret = { belop: 1234 };
    const refusjonEndringer: Array<EndringsBelop> = [
      { dato: parseIsoDate('2022-02-02'), belop: 1234 },
      { dato: parseIsoDate('2022-03-03'), belop: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        lonn={lonn}
        harRefusjonEndringer={'Ja'}
        refusjonEndringer={refusjonEndringer}
        refusjonskravetOpphoerer={{ status: 'Nei' }}
      />
    );

    // const { container } = render(<LonnUnderSykefravaeret lonn={lonn} refusjonEndringer={refusjonEndringer} />);
    // { dato: parseIsoDate('2022-03-03'), belop: 432 } />);

    const HeadingTitle = screen.getByText(/NAV vil refundere opp/);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders a title text and refusjon endringer', async () => {
    const lonn: LonnISykefravaeret = { belop: 2345 };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = { status: 'Nei' };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBelop> = [
      { dato: parseIsoDate('2022-02-02'), belop: 1234 },
      { dato: parseIsoDate('2022-03-03'), belop: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        lonn={lonn}
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
    const lonn: LonnISykefravaeret = { belop: 2345 };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja',
      opphorsdato: parseIsoDate('2022-04-04')
    };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBelop> = [
      { dato: parseIsoDate('2022-02-02'), belop: 1234 },
      { dato: parseIsoDate('2022-03-03'), belop: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        lonn={lonn}
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
    const lonn: LonnISykefravaeret = { belop: 2345, status: 'Nei' };
    const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja',
      opphorsdato: parseIsoDate('2022-04-04')
    };
    const harRefusjonEndringer: YesNo = 'Ja';
    const refusjonEndringer: Array<EndringsBelop> = [
      { dato: parseIsoDate('2022-02-02'), belop: 1234 },
      { dato: parseIsoDate('2022-03-03'), belop: 432 }
    ];

    const { container } = render(
      <LonnUnderSykefravaeret
        lonn={lonn}
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
});
