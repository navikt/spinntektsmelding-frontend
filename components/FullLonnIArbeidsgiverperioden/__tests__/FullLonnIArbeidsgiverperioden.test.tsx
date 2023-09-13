import { render, screen } from '@testing-library/react';
import FullLonnIArbeidsgiverperioden from '../FullLonnIArbeidsgiverperioden';

describe('FullLonnIArbeidsgiverperioden', () => {
  it('should render nothing if lonnIPerioden is falsy', () => {
    render(<FullLonnIArbeidsgiverperioden lonnIPerioden={null} />);
    expect(screen.queryByText(/Ja|Nei/)).not.toBeInTheDocument();
  });

  it('should render "Ja" if lonnIPerioden.status is "Ja"', () => {
    render(<FullLonnIArbeidsgiverperioden lonnIPerioden={{ status: 'Ja' }} />);
    expect(screen.getByText('Ja')).toBeInTheDocument();
  });

  it('should render "Nei" and other details if lonnIPerioden.status is "Nei"', () => {
    const lonnIPerioden = {
      status: 'Nei',
      utbetalt: 1000,
      begrunnelse: 'TidligereVirksomhet'
    };
    render(<FullLonnIArbeidsgiverperioden lonnIPerioden={lonnIPerioden} />);
    expect(screen.getByText('Nei')).toBeInTheDocument();
    expect(screen.getByText('Utbetalt under arbeidsgiverperiode')).toBeInTheDocument();
    // expect(screen.getByText('1000 kr')).toBeInTheDocument();
    expect(screen.getByText('Begrunnelse for ingen eller redusert utbetaling')).toBeInTheDocument();
    expect(screen.getByText(/Arbeidsgiverperioden er helt eller delvis/)).toBeInTheDocument();
  });

  it('should render nothing if lonnIPerioden is undefined', () => {
    render(<FullLonnIArbeidsgiverperioden />);
    expect(screen.queryByText(/Ja|Nei/)).not.toBeInTheDocument();
  });
});
