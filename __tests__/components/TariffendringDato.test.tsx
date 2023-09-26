import { fireEvent, render, screen } from '@testing-library/react';
import TariffendringDato from '../../components/Bruttoinntekt/TariffendringDato';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';

describe('TariffendringDato', () => {
  const changeTariffEndretDato = vi.fn();
  const changeTariffKjentDato = vi.fn();

  it('should render two date pickers', () => {
    render(
      <TariffendringDato
        changeTariffEndretDato={changeTariffEndretDato}
        changeTariffKjentDato={changeTariffKjentDato}
      />
    );

    const datePickers = screen.getAllByRole('textbox');
    expect(datePickers).toHaveLength(2);
  });

  it('should call changeTariffEndretDato when the first date picker is changed', () => {
    render(
      <TariffendringDato
        changeTariffEndretDato={changeTariffEndretDato}
        changeTariffKjentDato={changeTariffKjentDato}
      />
    );

    const firstDatePicker = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstDatePicker, { target: { value: '01.01.2022' } });
    expect(changeTariffEndretDato).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });

  it('should call changeTariffKjentDato when the second date picker is changed', () => {
    render(
      <TariffendringDato
        changeTariffEndretDato={changeTariffEndretDato}
        changeTariffKjentDato={changeTariffKjentDato}
      />
    );

    const secondDatePicker = screen.getAllByRole('textbox')[1];
    fireEvent.change(secondDatePicker, { target: { value: '01.01.2022' } });
    expect(changeTariffKjentDato).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });
});
