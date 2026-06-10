import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Faisu from '../../components/Faisu/Faisu';

type FaisuArbeidsforholdSkjema = {
  inntekt?: number;
  stillingsprosent?: number;
  yrkesKode?: string;
  yrkesbeskrivelse?: string;
  inkludertISykefravaer?: boolean;
};

type TestFormValues = {
  flereArbeidsforhold?: {
    harLikLoenn?: 'Ja' | 'Nei';
    erSykmeldtFraAlle?: 'Ja' | 'Nei';
    arbeidsforhold?: Array<FaisuArbeidsforholdSkjema>;
  };
};

function TestWrapper({
  children,
  defaultValues
}: Readonly<{
  children: React.ReactNode;
  defaultValues?: TestFormValues;
}>) {
  const methods = useForm<TestFormValues>({
    defaultValues
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

function FormStateProbe() {
  const value = useWatch<TestFormValues>({ name: 'flereArbeidsforhold' });
  return <pre data-testid='faisu-form-state'>{JSON.stringify(value ?? null)}</pre>;
}

const arbeidsforhold = [
  {
    yrkesbeskrivelse: 'Utvikler',
    yrkesKode: '1234',
    inntekt: 10000,
    stillingsprosent: 40,
    inkludertISykefravaer: true
  },
  {
    yrkesbeskrivelse: 'Designer',
    yrkesKode: '5678',
    inntekt: 20000,
    stillingsprosent: 60,
    inkludertISykefravaer: false
  }
];

describe('Faisu', () => {
  it('renders nothing when harGradertSykmeldingOgFlereArbeidsforhold is false', () => {
    render(
      <TestWrapper>
        <Faisu harGradertSykmeldingOgFlereArbeidsforhold={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Månedslønn - Flere arbeidsforhold')).not.toBeInTheDocument();
  });

  it('renders intro and first question when enabled', () => {
    render(
      <TestWrapper>
        <Faisu harGradertSykmeldingOgFlereArbeidsforhold />
      </TestWrapper>
    );

    expect(screen.getByText('Månedslønn - Flere arbeidsforhold')).toBeInTheDocument();
    expect(
      screen.getByText('Har ansatt lik eller tilnærmet lik lønn i arbeidsforholdene (timelønn)?')
    ).toBeInTheDocument();
  });

  it('shows follow-up question when harLikLoenn is Nei', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Faisu harGradertSykmeldingOgFlereArbeidsforhold />
      </TestWrapper>
    );

    await user.click(screen.getAllByLabelText('Nei')[0]);

    await waitFor(() => {
      expect(screen.getByText('Er personen sykmeldt fra alle arbeidsforhold?')).toBeInTheDocument();
    });
  });

  it('shows arbeidsforhold details when both answers are Nei', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper
        defaultValues={{
          flereArbeidsforhold: {
            arbeidsforhold
          }
        }}
      >
        <Faisu harGradertSykmeldingOgFlereArbeidsforhold />
      </TestWrapper>
    );

    await user.click(screen.getAllByLabelText('Nei')[0]);
    await user.click(screen.getAllByLabelText('Nei')[1]);

    await waitFor(() => {
      expect(screen.getByText('Hvilket arbeidsforhold gjelder sykefraværet for?')).toBeInTheDocument();
      expect(screen.getByLabelText('Utvikler')).toBeInTheDocument();
      expect(screen.getByLabelText('Månedslønn for Utvikler')).toBeInTheDocument();
      expect(screen.getByLabelText('Stillingsprosent for Utvikler')).toBeInTheDocument();
    });
  });

  it('resets erSykmeldtFraAlle and arbeidsforhold when harLikLoenn is set to Ja', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper
        defaultValues={{
          flereArbeidsforhold: {
            harLikLoenn: 'Nei',
            erSykmeldtFraAlle: 'Nei',
            arbeidsforhold
          }
        }}
      >
        <Faisu harGradertSykmeldingOgFlereArbeidsforhold />
        <FormStateProbe />
      </TestWrapper>
    );

    const likLoennGroup = screen.getByRole('radiogroup', {
      name: 'Har ansatt lik eller tilnærmet lik lønn i arbeidsforholdene (timelønn)?'
    });
    await user.click(within(likLoennGroup).getByLabelText('Ja'));

    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('faisu-form-state').textContent || 'null');
      expect(state.harLikLoenn).toBe('Ja');
      expect(state.erSykmeldtFraAlle).toBeUndefined();
      expect(state.arbeidsforhold).toEqual([]);
    });
  });

  it('parses comma number input to numeric value in form state', async () => {
    render(
      <TestWrapper
        defaultValues={{
          flereArbeidsforhold: {
            harLikLoenn: 'Nei',
            erSykmeldtFraAlle: 'Nei',
            arbeidsforhold
          }
        }}
      >
        <Faisu harGradertSykmeldingOgFlereArbeidsforhold />
        <FormStateProbe />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Månedslønn for Utvikler');
    fireEvent.change(input, { target: { value: '123,45' } });

    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('faisu-form-state').textContent || 'null');
      expect(state.arbeidsforhold[0].inntekt).toBe(123.45);
    });
  });
});
