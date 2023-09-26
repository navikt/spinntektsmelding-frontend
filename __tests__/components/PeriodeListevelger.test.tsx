import { render, screen, fireEvent } from '@testing-library/react';
import PeriodeListevelger from '../../components/Bruttoinntekt/PeriodeListevelger';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';

describe('PeriodeListevelger', () => {
  const onRangeListChange = vi.fn();
  const fomTekst = 'Fom';
  const tomTekst = 'Tom';
  const fomIdBase = 'fom';
  const tomIdBase = 'tom';

  beforeEach(() => {
    onRangeListChange.mockClear();
  });

  it('should render a Periodevelger component for each range in defaultRange', () => {
    const defaultRange = [{ id: '1' }, { id: '2' }];
    render(
      <PeriodeListevelger
        onRangeListChange={onRangeListChange}
        defaultRange={defaultRange}
        fomTekst={fomTekst}
        tomTekst={tomTekst}
        fomIdBase={fomIdBase}
        tomIdBase={tomIdBase}
      />
    );

    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('should not render a single Periodevelger component if defaultRange is not provided', () => {
    render(
      <PeriodeListevelger
        onRangeListChange={onRangeListChange}
        fomTekst={fomTekst}
        tomTekst={tomTekst}
        fomIdBase={fomIdBase}
        tomIdBase={tomIdBase}
      />
    );

    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });

  it('should call onRangeListChange with the updated range when a Periodevelger component is changed', () => {
    const defaultRange = [{ id: '1' }];
    render(
      <PeriodeListevelger
        onRangeListChange={onRangeListChange}
        defaultRange={defaultRange}
        fomTekst={fomTekst}
        tomTekst={tomTekst}
        fomIdBase={fomIdBase}
        tomIdBase={tomIdBase}
      />
    );

    const fomInput = screen.getAllByRole('textbox')[0];
    const tomInput = screen.getAllByRole('textbox')[1];

    fireEvent.change(fomInput, { target: { value: '01.01.2022' } });
    fireEvent.change(tomInput, { target: { value: '31.01.2022' } });

    expect(onRangeListChange).toHaveBeenCalledWith([{ id: '1', fom: parseIsoDate('2022-01-01'), tom: undefined }]);
    expect(onRangeListChange).toHaveBeenCalledWith([{ id: '1', fom: undefined, tom: parseIsoDate('2022-01-31') }]);
  });

  it('should call onRangeListChange with the updated range when a Periodevelger component is deleted', () => {
    const defaultRange = [{ id: '1' }, { id: '2' }];
    render(
      <PeriodeListevelger
        onRangeListChange={onRangeListChange}
        defaultRange={defaultRange}
        fomTekst={fomTekst}
        tomTekst={tomTekst}
        fomIdBase={fomIdBase}
        tomIdBase={tomIdBase}
      />
    );

    const deleteButton = screen.getAllByRole('button', { name: /slett/i })[0];

    fireEvent.click(deleteButton);

    expect(onRangeListChange).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('should call onRangeListChange with the updated range when a new Periodevelger component is added', () => {
    const defaultRange = [{ id: '1' }];
    render(
      <PeriodeListevelger
        onRangeListChange={onRangeListChange}
        defaultRange={defaultRange}
        fomTekst={fomTekst}
        tomTekst={tomTekst}
        fomIdBase={fomIdBase}
        tomIdBase={tomIdBase}
      />
    );

    const addButton = screen.getByRole('button', { name: /legg til periode/i });

    fireEvent.click(addButton);

    expect(onRangeListChange).toHaveBeenCalledWith([{ id: '1' }, { id: expect.any(String) }]);
  });
});
