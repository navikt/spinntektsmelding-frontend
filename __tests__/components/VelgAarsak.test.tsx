import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import VelgAarsak from '../../components/VelgAarsak/VelgAarsak';
// import VelgAarsak from './VelgAarsak';

vi.mock('react-hook-form', () => ({
  Controller: ({ render }) =>
    render({
      field: {
        name: 'aarsak',
        value: '',
        onChange: () => {},
        onBlur: () => {}
      }
    }),
  useFormContext: () => ({
    formState: { errors: {} }
  })
}));

vi.mock('../../utils/findErrorInRHFErrors', () => ({
  default: vi.fn(() => undefined)
}));

describe('VelgAarsak', () => {
  const legend = 'Velg årsak';
  const name = 'aarsak';

  it('renders the legend and all radio options', () => {
    render(<VelgAarsak legend={legend} name={name} />);

    // RadioGroup should have the correct accessible name
    expect(screen.getByRole('radiogroup', { name: legend })).toBeInTheDocument();

    // Each radio option by its label
    expect(
      screen.getByLabelText(
        /Ansatte som ikke er registrert i Aa-registeret, eller ikke kan sende digital søknad om sykepenger/
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Fisker med hyre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annen årsak/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enkeltstående behandlingsdager/)).toBeInTheDocument();
  });

  it('preserves the formatted accessible description for behandlingsdager', () => {
    render(<VelgAarsak legend={legend} name={name} />);

    const radio = screen.getByRole('radio', { name: 'Enkeltstående behandlingsdager' });
    const description = document.getElementById(radio.getAttribute('aria-describedby')!);

    expect(radio).toHaveAccessibleDescription(
      'Ansatt som har godkjent sykmelding og sendt søknad for enkeltstående behandlingsdager. ' +
        'Inneholder arbeidsgiverperioden en kombinasjon av behandlingsdager og annet sykefravær slik at den ' +
        'varer i 16 dager, må du velge Annen årsak og knytte inntektsmeldingen til søknaden for det ' +
        'ordinære sykefraværet og legge til behandlingsdagene og eventuelle egenmeldingsdager i arbeidsgiverperioden.'
    );
    expect(description?.querySelector('span')?.className).toContain('toppsetning');
    expect(description?.querySelector('em')).toHaveTextContent('Annen årsak');
  });

  it.skip('allows selecting a radio option', async () => {
    render(<VelgAarsak legend={legend} name={name} />);

    // const fiskerRadio = screen.getByLabelText('Fisker med hyre') as HTMLInputElement;
    const fiskerRadio = screen.getByRole('radio', { name: /Fisker med hyre/i });

    await userEvent.click(fiskerRadio);
    expect(fiskerRadio).toBeChecked();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<VelgAarsak legend={legend} name={name} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
