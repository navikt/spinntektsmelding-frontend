import { render } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { startOfDay, subYears } from 'date-fns';
import { vi, expect, describe, beforeEach, it } from 'vitest';

import Arbeidsgiverperiode from '../../../components/Arbeidsgiverperiode';
import useBoundStore from '../../../state/useBoundStore';
import { Periode } from '../../../state/state';
import { SkjemaStatus } from '../../../state/useSkjemadataStore';

const { periodevelgerProps } = vi.hoisted(() => ({ periodevelgerProps: [] as Array<Record<string, unknown>> }));

vi.mock('next/router', () => require('next-router-mock'));

vi.mock('../../../components/Bruttoinntekt/Periodevelger', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    periodevelgerProps.push(props);
    return <div data-testid='periodevelger' />;
  }
}));

function TestWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const methods = useForm({
    defaultValues: {
      agp: {
        perioder: [],
        redusertLoennIAgp: {
          beloep: undefined,
          begrunnelse: undefined
        }
      }
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

const initialState = useBoundStore.getState();

const mockSetIsDirtyForm = vi.fn();
const mockOnTilbakestillArbeidsgiverperiode = vi.fn();

function renderArbeidsgiverperiode(skalViseArbeidsgiverperiode: boolean) {
  return render(
    <TestWrapper>
      <Arbeidsgiverperiode
        arbeidsgiverperioder={[]}
        setIsDirtyForm={mockSetIsDirtyForm}
        skjemastatus={SkjemaStatus.FULL}
        onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
        skalViseArbeidsgiverperiode={skalViseArbeidsgiverperiode}
        skalViseEgenmelding={false}
      />
    </TestWrapper>
  );
}

describe('Arbeidsgiverperiode minFomDate', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
    periodevelgerProps.length = 0;
    vi.clearAllMocks();
  });

  it('should use the earliest fom from egenmeldingsperioder when it starts before sykmeldingsperioder', () => {
    const sykmeldingsperioder: Array<Periode> = [{ fom: new Date(2025, 5, 10), tom: new Date(2025, 5, 20), id: 's1' }];
    const egenmeldingsperioder: Array<Periode> = [{ fom: new Date(2025, 5, 1), tom: new Date(2025, 5, 9), id: 'e1' }];

    useBoundStore.setState({ sykmeldingsperioder, egenmeldingsperioder, endretArbeidsgiverperiode: true });

    renderArbeidsgiverperiode(true);

    expect(periodevelgerProps.at(-1)?.fromDate).toEqual(new Date(2025, 5, 2));
  });

  it('should use the earliest sykmeldingsperiode fom when there are no egenmeldingsperioder', () => {
    const sykmeldingsperioder: Array<Periode> = [
      { fom: new Date(2025, 5, 10), tom: new Date(2025, 5, 20), id: 's1' },
      { fom: new Date(2025, 4, 1), tom: new Date(2025, 4, 9), id: 's2' }
    ];

    useBoundStore.setState({ sykmeldingsperioder, egenmeldingsperioder: [], endretArbeidsgiverperiode: true });

    renderArbeidsgiverperiode(true);

    expect(periodevelgerProps.at(-1)?.fromDate).toEqual(new Date(2025, 4, 2));
  });

  it('should ignore perioder without fom', () => {
    const sykmeldingsperioder: Array<Periode> = [
      { fom: undefined, tom: new Date(2025, 5, 20), id: 's1' },
      { fom: new Date(2025, 5, 5), tom: new Date(2025, 5, 15), id: 's2' }
    ];

    useBoundStore.setState({ sykmeldingsperioder, egenmeldingsperioder: [], endretArbeidsgiverperiode: true });

    renderArbeidsgiverperiode(true);

    expect(periodevelgerProps.at(-1)?.fromDate).toEqual(new Date(2025, 5, 6));
  });

  it('should fall back to four years ago when arbeidsgiverperiode is not shown', () => {
    const sykmeldingsperioder: Array<Periode> = [{ fom: new Date(2025, 5, 10), tom: new Date(2025, 5, 20), id: 's1' }];

    useBoundStore.setState({ sykmeldingsperioder, egenmeldingsperioder: [], endretArbeidsgiverperiode: true });

    renderArbeidsgiverperiode(false);

    expect(periodevelgerProps.at(-1)?.fromDate).toEqual(startOfDay(subYears(new Date(), 4)));
  });
});
