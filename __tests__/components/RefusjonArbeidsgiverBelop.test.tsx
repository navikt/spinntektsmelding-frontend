import { render, screen, fireEvent } from '@testing-library/react';
import RefusjonArbeidsgiverBelop from '../../components/RefusjonArbeidsgiver/RefusjonArbeidsgiverBelop';
import { vi, expect } from 'vitest';

describe('RefusjonArbeidsgiverBelop', () => {
  const bruttoinntekt = 500000;
  const onOppdaterBelop = vi.fn();
  const visFeilmeldingTekst = vi.fn();
  const arbeidsgiverperiodeDisabled = false;

  it('should render the component with the correct props', () => {
    render(
      <RefusjonArbeidsgiverBelop
        bruttoinntekt={bruttoinntekt}
        onOppdaterBelop={onOppdaterBelop}
        visFeilmeldingTekst={visFeilmeldingTekst}
        arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
      />
    );

    expect(screen.getByText('Refusjon til arbeidsgiver etter arbeidsgiverperiode')).toBeInTheDocument();
    expect(screen.getByText(/500 000,00/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil refundere opp til 6G av årslønn./
      )
    ).toBeInTheDocument();
  });

  it('should render the component with the correct props when arbeidsgiverperiodeDisabled is true', () => {
    render(
      <RefusjonArbeidsgiverBelop
        bruttoinntekt={bruttoinntekt}
        onOppdaterBelop={onOppdaterBelop}
        visFeilmeldingTekst={visFeilmeldingTekst}
        arbeidsgiverperiodeDisabled={true}
        onEditerbarChange={vi.fn()}
      />
    );

    expect(screen.getByText('Refusjon til arbeidsgiver i sykefraværet')).toBeInTheDocument();
    expect(screen.getByText(/500 000,00/)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Selv om arbeidstakeren har inntekt over 6G skal arbeidsgiver ikke redusere beløpet. Dette gjør Nav. Nav vil refundere opp til 6G av årslønn.'
      )
    ).toBeInTheDocument();
  });

  it('should render the component with an edit button', () => {
    render(
      <RefusjonArbeidsgiverBelop
        bruttoinntekt={bruttoinntekt}
        onOppdaterBelop={onOppdaterBelop}
        visFeilmeldingTekst={visFeilmeldingTekst}
        arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
        onEditerbarChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Endre' })).toBeInTheDocument();
  });

  it('should render the component with an editable input field when the edit button is clicked', () => {
    render(
      <RefusjonArbeidsgiverBelop
        bruttoinntekt={bruttoinntekt}
        onOppdaterBelop={onOppdaterBelop}
        visFeilmeldingTekst={visFeilmeldingTekst}
        arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
        onEditerbarChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Endre' }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should call onOppdaterBelop when the input field is changed', () => {
    const onEditerbarChange = vi.fn();
    render(
      <RefusjonArbeidsgiverBelop
        bruttoinntekt={bruttoinntekt}
        onOppdaterBelop={onOppdaterBelop}
        visFeilmeldingTekst={visFeilmeldingTekst}
        arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
        onEditerbarChange={onEditerbarChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Endre' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 600000 } });
    fireEvent.blur(screen.getByRole('textbox'));

    expect(onOppdaterBelop).toHaveBeenCalledWith('600000');
    expect(onEditerbarChange).toHaveBeenCalledWith(true);
  });
});
