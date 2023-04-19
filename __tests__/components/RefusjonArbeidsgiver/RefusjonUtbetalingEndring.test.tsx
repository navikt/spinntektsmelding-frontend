import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import RefusjonUtbetalingEndring, {
  EndringsBelop
} from '../../../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import { vi } from 'vitest';

describe('RefusjonUtbetalingEndring', () => {
  it('should have no violations and show some text', async () => {
    const endringer = [{}];
    const { container } = render(<RefusjonUtbetalingEndring endringer={endringer}></RefusjonUtbetalingEndring>);

    const HeadingTitle = screen.getByText(/Er det endringer i refusjonsbeløpet i perioden?/i);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should add periode when "Legg til periode" is clicked', async () => {
    const endringer = [{}];
    const onOppdaterEndringer = vi.fn();

    render(
      <RefusjonUtbetalingEndring
        endringer={endringer}
        onOppdaterEndringer={onOppdaterEndringer}
        harRefusjonEndring={'Ja'}
      ></RefusjonUtbetalingEndring>
    );

    const Button = screen.getByText(/Legg til periode/i);

    Button.click();

    expect(onOppdaterEndringer).toHaveBeenCalledWith([{}, {}]);
  });

  it('should do stuff when Ja is clicked', async () => {
    const endringer = [{}];
    const onOppdaterEndringer = vi.fn();
    const onHarEndringer = vi.fn();

    render(
      <RefusjonUtbetalingEndring
        endringer={endringer}
        onOppdaterEndringer={onOppdaterEndringer}
        onHarEndringer={onHarEndringer}
        // harRefusjonEndring={'Ja'}
      ></RefusjonUtbetalingEndring>
    );

    const Button = screen.getByText(/Ja/i);

    Button.click();

    expect(onHarEndringer).toHaveBeenCalledWith('Ja');
  });

  it('should add periode when "Legg til periode" is clicked and delete it when "Slett" is clicked', async () => {
    const endringer: Array<EndringsBelop> = [{ belop: 1234 }, {}];
    const onOppdaterEndringer = vi.fn();

    render(
      <RefusjonUtbetalingEndring
        endringer={endringer}
        onOppdaterEndringer={onOppdaterEndringer}
        harRefusjonEndring={'Ja'}
      ></RefusjonUtbetalingEndring>
    );

    const SlettButton = screen.getByTitle(/Slett periode/i);

    fireEvent.click(SlettButton);

    expect(onOppdaterEndringer).toHaveBeenCalledWith([{ belop: 1234 }]);
  });

  it('should do stuff when beløp is changed', async () => {
    const endringer = [{}];
    const onOppdaterEndringer = vi.fn();
    const onHarEndringer = vi.fn();

    render(
      <RefusjonUtbetalingEndring
        endringer={endringer}
        onOppdaterEndringer={onOppdaterEndringer}
        onHarEndringer={onHarEndringer}
        harRefusjonEndring={'Ja'}
      ></RefusjonUtbetalingEndring>
    );

    const Input = screen.getByLabelText(/Endret refusjon/i);

    fireEvent.change(Input, {
      target: { value: '1234' }
    });

    expect(onOppdaterEndringer).toHaveBeenCalledWith([{ belop: 1234 }]);
  });

  it('should do stuff when dato is changed', async () => {
    const endringer = [{}];
    const onOppdaterEndringer = vi.fn();
    const onHarEndringer = vi.fn();

    render(
      <RefusjonUtbetalingEndring
        endringer={endringer}
        onOppdaterEndringer={onOppdaterEndringer}
        onHarEndringer={onHarEndringer}
        harRefusjonEndring={'Ja'}
      ></RefusjonUtbetalingEndring>
    );

    const Input = screen.getByLabelText(/Dato for endring/i);

    fireEvent.change(Input, {
      target: { value: '11.11.2022' }
    });

    expect(onOppdaterEndringer).toHaveBeenCalledWith([{ dato: new Date(2022, 10, 11) }]);
  });
});
