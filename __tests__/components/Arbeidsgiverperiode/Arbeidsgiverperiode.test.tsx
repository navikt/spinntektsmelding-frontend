import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect } from 'react';

import Arbeidsgiverperiode from '../../../components/Arbeidsgiverperiode';
import { Periode } from '../../../state/state';
import { vi, expect, describe, beforeEach } from 'vitest';
import { SkjemaStatus } from '../../../state/useSkjemadataStore';
import useBoundStore from '../../../state/useBoundStore';

vi.mock('../../../components/Datovelger', () => ({
  default: () => <div>Datovelger</div>
}));

function TestWrapper({
  children,
  defaultValues = {}
}: Readonly<{
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}>) {
  const methods = useForm({
    defaultValues: {
      agp: {
        perioder: [],
        redusertLoennIAgp: {
          beloep: undefined,
          begrunnelse: undefined
        }
      },
      fullLonn: undefined,
      ...defaultValues
    }
  });
  useEffect(() => {
    getFormValues = methods.getValues;
  }, [methods.getValues]);
  return (
    <FormProvider {...methods}>
      {children}
      <input type='hidden' {...methods.register('fullLonn')} />
    </FormProvider>
  );
}

const initialState = useBoundStore.getState();
const mockSetIsDirtyForm = vi.fn();
const mockOnTilbakestillArbeidsgiverperiode = vi.fn();
let getFormValues: () => unknown = () => ({});

describe('TidligereInntekt', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
    vi.clearAllMocks();
    getFormValues = () => ({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have no violations', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    const { container } = render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={true}
        />
      </TestWrapper>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be able to add periode', async () => {
    const user = userEvent.setup();
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    const { container } = render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={true}
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Endre'));

    const leggTilKnapp = await screen.findByText('Legg til periode');
    expect(leggTilKnapp).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should give a warning when arbeidsgiverperiode is more than 16 days', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 24), id: '123' }];

    const { container } = render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={true}
        />
      </TestWrapper>
    );

    const tekst = screen.getByText(
      'Arbeidsgiverperioden er oppgitt til 19 dager, men kan ikke være mer enn 16 dager totalt.'
    );

    expect(tekst).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should give a warning when arbeidsgiverperiode is empty', async () => {
    const arbeidsgiverperiode: Array<Periode> = [];

    const { container } = render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={true}
        />
      </TestWrapper>
    );

    const tekst = screen.getByText(/Du har lagt inn arbeidsgiverperiode på 0 dager./);

    expect(tekst).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be able to tilbakestille', async () => {
    const user = userEvent.setup();
    const arbeidsgiverperiode = undefined;

    const { container } = render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={true}
          skalViseEgenmelding={false}
        />
      </TestWrapper>
    );

    const tekst = screen.getByText(/Velg begrunnelse for kort arbeidsgiverperiode/);

    expect(tekst).toBeInTheDocument();

    await user.click(screen.getByText('Endre'));
    await user.click(screen.getByText('Tilbakestill'));

    const leggTilKnapp = await screen.findByText('Legg til periode');
    expect(leggTilKnapp).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show egenmelding text when skalViseEgenmelding is true and skalViseArbeidsgiverperiode is false', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={true}
        />
      </TestWrapper>
    );

    const egenmeldingTekst = screen.getByText(
      /Vi har brukt egenmeldinger og sykmeldingsperiode til å foreslå en arbeidsgiverperiode/
    );

    expect(egenmeldingTekst).toBeInTheDocument();
  });

  it('should not show egenmelding text when skalViseEgenmelding is false', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={false}
        />
      </TestWrapper>
    );

    const egenmeldingTekst = screen.queryByText(
      /Vi har brukt egenmeldinger og sykmeldingsperiode til å foreslå en arbeidsgiverperiode/
    );

    expect(egenmeldingTekst).not.toBeInTheDocument();
  });

  it('should not show egenmelding text when skalViseArbeidsgiverperiode is true regardless of skalViseEgenmelding', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={true}
          skalViseEgenmelding={true}
        />
      </TestWrapper>
    );

    const egenmeldingTekst = screen.queryByText(
      /Vi har brukt egenmeldinger og sykmeldingsperiode til å foreslå en arbeidsgiverperiode/
    );

    expect(egenmeldingTekst).not.toBeInTheDocument();
  });

  it('should always show external link when arbeidsgiverperiode is not shown', async () => {
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={false}
        />
      </TestWrapper>
    );

    const eksternLink = screen.getByText('Les mer om arbeidsgiverperiode og hvordan denne beregnes.');

    expect(eksternLink).toBeInTheDocument();
  });

  it('should update the employer period state when toggling no employer period', async () => {
    const user = userEvent.setup();
    const arbeidsgiverperiode: Array<Periode> = [{ fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }];

    render(
      <TestWrapper
        defaultValues={{
          agp: {
            perioder: arbeidsgiverperiode,
            redusertLoennIAgp: { beloep: 500, begrunnelse: 'Annet' }
          }
        }}
      >
        <Arbeidsgiverperiode
          arbeidsgiverperioder={arbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.FULL}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={false}
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Endre'));
    const noEmployerPeriodCheckbox = screen.getByRole('checkbox', {
      name: 'Det er ikke arbeidsgiverperiode i dette sykefraværet'
    });

    await user.click(noEmployerPeriodCheckbox);

    expect(useBoundStore.getState().arbeidsgiverperiodeDisabled).toBe(true);
    expect(useBoundStore.getState().arbeidsgiverperioder).toEqual([]);
    expect(getFormValues()).toMatchObject({ fullLonn: 'Nei' });
    expect(getFormValues()).toMatchObject({ agp: { redusertLoennIAgp: { beloep: 0, begrunnelse: 'Annet' } } });

    await user.click(noEmployerPeriodCheckbox);

    expect(useBoundStore.getState().arbeidsgiverperiodeDisabled).toBe(false);
    expect(useBoundStore.getState().fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
    expect(mockSetIsDirtyForm).toHaveBeenCalledWith(true);
  });

  it('should update short-period state for self-determined employer periods', () => {
    const shortArbeidsgiverperiode: Array<Periode> = [
      { fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 16), id: '123' }
    ];
    const fullArbeidsgiverperiode: Array<Periode> = [
      { fom: new Date(2025, 6, 6), tom: new Date(2025, 6, 21), id: '123' }
    ];

    const { rerender } = render(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={shortArbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.SELVBESTEMT}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={false}
        />
      </TestWrapper>
    );

    expect(useBoundStore.getState().arbeidsgiverperiodeKort).toBe(true);
    expect(useBoundStore.getState().fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
    expect(getFormValues()).toMatchObject({ fullLonn: 'Nei' });

    rerender(
      <TestWrapper>
        <Arbeidsgiverperiode
          arbeidsgiverperioder={fullArbeidsgiverperiode}
          setIsDirtyForm={mockSetIsDirtyForm}
          skjemastatus={SkjemaStatus.SELVBESTEMT}
          onTilbakestillArbeidsgiverperiode={mockOnTilbakestillArbeidsgiverperiode}
          skalViseArbeidsgiverperiode={false}
          skalViseEgenmelding={false}
        />
      </TestWrapper>
    );

    expect(useBoundStore.getState().arbeidsgiverperiodeKort).toBe(false);
    expect(useBoundStore.getState().fullLonnIArbeidsgiverPerioden?.status).toBeUndefined();
  });
});
