import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import BortfallNaturalytelser from '../../components/BortfallNaturalytelser/BortfallNaturalytelser';
import { Naturalytelse } from '../../state/state';

describe('BortfallNaturalytelser', () => {
  it('renders a text', () => {
    const ytelser: Array<Naturalytelse> = [];
    render(<BortfallNaturalytelser ytelser={ytelser} />);

    const buttonTitle = screen.getByText('Ingen naturalytelser har falt bort');
    expect(buttonTitle).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const ytelser: Array<Naturalytelse> = [];
    const { container } = render(<BortfallNaturalytelser ytelser={ytelser} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders a text', () => {
    const ytelser: Array<Naturalytelse> = [
      { id: '1', type: 'FriTransport', bortfallsdato: new Date(2022, 2, 2), verdi: 1234.5 },
      { id: '2', type: 'KostbesparelseIHjemmet', bortfallsdato: new Date(2022, 2, 2), verdi: 1234.5 }
    ];
    render(<BortfallNaturalytelser ytelser={ytelser} />);

    const transport = screen.getByText('Fri transport');
    expect(transport).toBeInTheDocument();

    const kost = screen.getByText('Kostbesparelse i hjemmet');
    expect(kost).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const ytelser: Array<Naturalytelse> = [
      { id: '1', type: 'FriTransport', bortfallsdato: new Date(2022, 2, 2), verdi: 1234.5 }
    ];

    const { container } = render(<BortfallNaturalytelser ytelser={ytelser} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
