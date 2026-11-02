import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import type { Forespoersel } from '../../schema/EndepunktSykepengesoeknaderSchema';
import type { SykepengePeriode } from '../../utils/useInitieringData';
import useInitieringPeriodevalg, { type PeriodevalgSkjema } from '../../utils/useInitieringPeriodevalg';

const perioder: SykepengePeriode[] = [
  {
    id: 'uten-forespoersel',
    fom: new Date('2023-01-01'),
    tom: new Date('2023-01-10'),
    forlengerVedtaksperiodeId: 'ukjent'
  },
  {
    id: 'forlengelse',
    fom: new Date('2023-01-11'),
    tom: new Date('2023-01-20'),
    forlengerVedtaksperiodeId: 'opprinnelig'
  },
  { id: 'vanlig', fom: new Date('2023-02-01'), tom: new Date('2023-02-10') }
];

const forespoersler: Forespoersel[] = [
  {
    forespoerselId: 'forespoersel',
    vedtaksperiodeId: 'opprinnelig',
    sykmeldingsperioder: [{ fom: '2022-12-01', tom: '2022-12-31' }],
    egenmeldingsperioder: [],
    erBesvart: false
  }
];

function renderPeriodevalg() {
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    const methods = useForm<PeriodevalgSkjema>({
      defaultValues: { forespurtSykepengePeriodeId: 'andrePerioder' }
    });
    methods.register('sykepengePeriodeId');
    methods.register('endreRefusjon');
    return <FormProvider {...methods}>{children}</FormProvider>;
  }

  return renderHook(
    () => ({
      form: useFormContext<PeriodevalgSkjema>(),
      valg: useInitieringPeriodevalg(perioder, forespoersler)
    }),
    { wrapper: Wrapper }
  );
}

describe('useInitieringPeriodevalg', () => {
  it('detects a matching request among all selected extensions', () => {
    const { result } = renderPeriodevalg();
    act(() => result.current.form.setValue('sykepengePeriodeId', ['uten-forespoersel', 'forlengelse']));

    expect(result.current.valg.valgtePerioder).toHaveLength(2);
    expect(result.current.valg.harValgtPeriodeMedForlengelse).toBe(true);
  });

  it('does not show refund choices for extensions without a matching request', () => {
    const { result } = renderPeriodevalg();
    act(() => result.current.form.setValue('sykepengePeriodeId', ['uten-forespoersel']));

    expect(result.current.valg.harValgtPeriodeMedForlengelse).toBe(false);
  });

  it('clears selected periods and refund answers when changing the radio choice', () => {
    const { result } = renderPeriodevalg();
    act(() => {
      result.current.form.setValue('sykepengePeriodeId', ['forlengelse']);
      result.current.form.setValue('endreRefusjon', 'Ja');
    });
    act(() =>
      result.current.valg.onRadioChange('forespoersel', {
        name: 'forespurtSykepengePeriodeId',
        value: 'andrePerioder',
        onChange: (value: string) => result.current.form.setValue('forespurtSykepengePeriodeId', value),
        onBlur: vi.fn(),
        ref: vi.fn()
      })
    );

    expect(result.current.form.getValues('sykepengePeriodeId')).toBeUndefined();
    expect(result.current.valg.endreRefusjon).toBeUndefined();
    expect(result.current.valg.valgtePerioder).toEqual([]);
    expect(result.current.valg.disablePeriodeCheck).toBe(true);
  });

  it('clears the refund answer when the last matching extension is deselected', () => {
    const { result } = renderPeriodevalg();
    act(() => {
      result.current.form.setValue('sykepengePeriodeId', ['forlengelse']);
      result.current.form.setValue('endreRefusjon', 'Ja');
    });
    act(() =>
      result.current.valg.onCheckboxChange(['uten-forespoersel'], {
        name: 'sykepengePeriodeId',
        value: ['forlengelse'],
        onChange: (value: string[]) => result.current.form.setValue('sykepengePeriodeId', value),
        onBlur: vi.fn(),
        ref: vi.fn()
      })
    );

    expect(result.current.valg.endreRefusjon).toBeUndefined();
    expect(result.current.valg.harValgtPeriodeMedForlengelse).toBe(false);
  });

  it('derives the selection from the form after reset', () => {
    const { result } = renderPeriodevalg();
    act(() => {
      result.current.form.setValue('sykepengePeriodeId', ['forlengelse']);
      result.current.form.setValue('endreRefusjon', 'Nei');
    });
    expect(result.current.valg.harValgtPeriodeMedForlengelse).toBe(true);

    act(() => result.current.form.reset());

    expect(result.current.valg.valgtePerioder).toEqual([]);
    expect(result.current.valg.harValgtPeriodeMedForlengelse).toBe(false);
    expect(result.current.valg.endreRefusjon).toBeUndefined();
  });
});
